"use client";

import { useEffect, useCallback, useState } from "react";
import { useAccount, useWalletClient, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useGameStore } from "@/lib/store";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PLANETS } from "@/lib/wagmi";
import { encryptPlanetChoice, userDecrypt } from "@/lib/fhe";
import { PlanetButton } from "./PlanetButton";

export function GameSection() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const {
    fhevmStatus,
    gamePhase,
    selectedPlanet,
    gameResult,
    statusMessage,
    setGamePhase,
    setSelectedPlanet,
    setGameResult,
    setStatusMessage,
    resetGame,
  } = useGameStore();

  const [isDecrypting, setIsDecrypting] = useState(false);

  // Single play transaction (encrypt + submit in one tx)
  const { writeContract: playWrite, data: playHash, isPending: isPlaying, reset: resetPlay } = useWriteContract();
  const { isSuccess: playSuccess, isLoading: playLoading } = useWaitForTransactionReceipt({ hash: playHash });

  // Read result handle
  const { refetch: refetchHandle } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getResultHandle",
    account: address,
  });

  // After play success -> show decrypt button
  useEffect(() => {
    if (playSuccess && gamePhase === "encrypting") {
      setGamePhase("decrypting");
      setStatusMessage("✓ ON-CHAIN COMPLETE · CLICK DECRYPT");
      resetPlay();
    }
  }, [playSuccess, gamePhase, setGamePhase, setStatusMessage, resetPlay]);

  // Select planet
  const handleSelectPlanet = useCallback((planetId: number) => {
    if (gamePhase !== "idle" && gamePhase !== "selecting") return;
    setSelectedPlanet(planetId);
    setStatusMessage(null);
    if (gamePhase === "idle") {
      setGamePhase("selecting");
    }
  }, [gamePhase, setSelectedPlanet, setGamePhase, setStatusMessage]);

  // Submit: encrypt -> play (single transaction)
  const handleSubmit = useCallback(async () => {
    if (!address || !walletClient || selectedPlanet === null || fhevmStatus !== "ready") return;
    
    setGamePhase("encrypting");
    setStatusMessage("⏳ ENCRYPTING YOUR CHOICE...");
    
    try {
      // Step 1: Encrypt planet choice
      const encrypted = await encryptPlanetChoice(
        CONTRACT_ADDRESS,
        address,
        selectedPlanet
      );
      
      // Step 2: Single play transaction
      setStatusMessage("⏳ CONFIRM TRANSACTION IN WALLET...");
      
      playWrite({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "play",
        args: [encrypted.handle, encrypted.inputProof],
        gas: 3000000n,
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      setStatusMessage("❌ " + (error.message?.slice(0, 60) || "Encryption failed"));
      setGamePhase("selecting");
    }
  }, [address, walletClient, selectedPlanet, fhevmStatus, playWrite, setGamePhase, setStatusMessage]);

  // Decrypt result (userDecrypt - only 1 signature, no on-chain tx)
  const handleDecrypt = useCallback(async () => {
    if (!walletClient || !address || isDecrypting) return;
    
    setIsDecrypting(true);
    setStatusMessage("⏳ FETCHING RESULT HANDLE...");
    
    try {
      const { data: handle } = await refetchHandle();
      
      if (!handle) {
        throw new Error("Result not ready - please wait and try again");
      }
      
      setStatusMessage("⏳ SIGN TO DECRYPT (1 signature)...");
      
      // userDecrypt: generates keypair, signs EIP-712, decrypts via SDK
      const isMatch = await userDecrypt(
        handle as string,
        CONTRACT_ADDRESS,
        walletClient
      );
      
      setGameResult(isMatch);
      setGamePhase("result");
      setStatusMessage(isMatch ? "🎉 MATCH!" : "❌ NO MATCH");
    } catch (error: any) {
      console.error("Decrypt error:", error);
      const errMsg = error.message || "Unknown error";
      if (errMsg.includes("rejected") || errMsg.includes("denied")) {
        setStatusMessage("❌ SIGNATURE REJECTED - TRY AGAIN");
      } else if (errMsg.includes("not ready") || errMsg.includes("No result")) {
        setStatusMessage("❌ RESULT NOT READY - WAIT & RETRY");
      } else if (errMsg.includes("520") || errMsg.includes("relayer")) {
        setStatusMessage("❌ ZAMA RELAYER DOWN - TRY AGAIN LATER");
      } else if (errMsg.includes("not authorized")) {
        setStatusMessage("❌ ACL ERROR - REPLAY GAME");
      } else {
        setStatusMessage("❌ DECRYPT ERROR: " + errMsg.slice(0, 40));
      }
    } finally {
      setIsDecrypting(false);
    }
  }, [walletClient, address, refetchHandle, setGamePhase, setStatusMessage, setGameResult, isDecrypting]);

  // Play again
  const handlePlayAgain = useCallback(() => {
    resetGame();
    setSelectedPlanet(null);
    setGameResult(null);
  }, [resetGame, setSelectedPlanet, setGameResult]);

  // Determine states
  const canSelect = isConnected && fhevmStatus === "ready" && (gamePhase === "idle" || gamePhase === "selecting");
  const canSubmit = canSelect && selectedPlanet !== null;
  const isProcessing = isPlaying || playLoading;
  const showDecryptButton = gamePhase === "decrypting";
  const showResult = gamePhase === "result";

  return (
    <section id="game" className="min-h-screen relative z-10 px-4 flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto w-full">
        {/* Mystery Planet / Status Display */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div
              className={`
                text-[80px] md:text-[120px]
                ${isProcessing || isDecrypting ? "animate-pulse-glow" : "animate-float"}
              `}
              style={{
                filter: "drop-shadow(0 0 25px #FF00FF) drop-shadow(0 0 50px #00FFFF)",
              }}
            >
              {gameResult === true ? "🎉" : gameResult === false ? "💫" : "🪐"}
            </div>
            
            {/* Orbital Ring */}
            <div
              className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-[120px] h-[120px] md:w-[180px] md:h-[180px]
                border-2 border-neon-cyan/30 rounded-full
                ${isProcessing || isDecrypting ? "animate-spin-slow" : ""}
              `}
            />
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`font-mono text-base md:text-lg mt-4 ${
              statusMessage.startsWith("❌") ? "text-red-400" : 
              statusMessage.startsWith("✓") || statusMessage.startsWith("🎉") ? "text-neon-cyan text-glow-cyan" : 
              "text-neon-orange animate-pulse"
            }`}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Planet Selection Grid - Always visible when not showing result */}
        {!showResult && (
          <>
            <div className="grid grid-cols-4 gap-4 md:gap-5 mb-8">
              {PLANETS.map((planet) => (
                <PlanetButton
                  key={planet.id}
                  planet={planet}
                  isSelected={selectedPlanet === planet.id}
                  isDisabled={!canSelect || isProcessing || isDecrypting}
                  onClick={() => handleSelectPlanet(planet.id)}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              {/* Submit Button */}
              {!showDecryptButton && (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isProcessing}
                  className={`
                    px-10 md:px-16 py-4 md:py-5 font-heading text-lg md:text-2xl uppercase tracking-wider
                    border-2 transition-all duration-200
                    ${canSubmit && !isProcessing
                      ? "border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-void hover:shadow-neon-cyan"
                      : "opacity-50 cursor-not-allowed text-chrome/50 border-chrome/30"
                    }
                  `}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="spinner !w-6 !h-6" />
                      PROCESSING...
                    </span>
                  ) : !isConnected ? (
                    "CONNECT WALLET"
                  ) : fhevmStatus !== "ready" ? (
                    "FHE LOADING..."
                  ) : selectedPlanet === null ? (
                    "SELECT A PLANET"
                  ) : (
                    "LOCK IN & SUBMIT"
                  )}
                </button>
              )}

              {/* Decrypt Button */}
              {showDecryptButton && (
                <button
                  onClick={handleDecrypt}
                  disabled={isDecrypting}
                  className={`
                    px-10 md:px-16 py-4 md:py-5 font-heading text-lg md:text-2xl uppercase tracking-wider 
                    border-2 border-neon-magenta transition-all duration-200
                    ${isDecrypting 
                      ? "opacity-70 cursor-wait text-neon-magenta"
                      : "text-neon-magenta hover:bg-neon-magenta hover:text-void hover:shadow-neon-magenta animate-pulse-glow"
                    }
                  `}
                >
                  {isDecrypting ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="spinner !w-6 !h-6" />
                      DECRYPTING...
                    </span>
                  ) : (
                    "🔓 DECRYPT RESULT"
                  )}
                </button>
              )}
            </div>
          </>
        )}

        {/* Result State */}
        {showResult && (
          <div className="text-center">
            <div
              className={`
                font-heading text-5xl md:text-7xl mb-6 uppercase
                ${gameResult ? "text-neon-cyan text-glow-cyan" : "text-neon-magenta text-glow-magenta"}
              `}
            >
              {gameResult ? "PLANETARY ALIGNMENT!" : "COSMIC MISS"}
            </div>
            
            {selectedPlanet !== null && (
              <p className="font-mono text-xl md:text-2xl text-chrome/70 mb-10">
                You chose: {PLANETS[selectedPlanet].name} {PLANETS[selectedPlanet].emoji}
              </p>
            )}

            <button
              onClick={handlePlayAgain}
              className="px-14 py-5 font-heading text-2xl uppercase tracking-wider border-2 border-neon-orange text-neon-orange hover:bg-neon-orange hover:text-void hover:shadow-neon-orange transition-all duration-200"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
