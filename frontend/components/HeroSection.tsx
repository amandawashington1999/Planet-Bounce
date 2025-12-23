"use client";

import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useGameStore } from "@/lib/store";
import { initFhevm, isFhevmReady } from "@/lib/fhe";

export function HeroSection() {
  const { isConnected } = useAccount();
  const { fhevmStatus, setFhevmStatus, setFhevmError, resetGame } = useGameStore();

  // Initialize FHEVM on mount
  useEffect(() => {
    const init = async () => {
      if (fhevmStatus !== "idle") return;
      
      setFhevmStatus("initializing");
      try {
        await initFhevm();
        setFhevmStatus("ready");
      } catch (error: any) {
        console.error("FHEVM init error:", error);
        setFhevmError(error.message || "Failed to initialize");
        setFhevmStatus("error");
      }
    };
    
    init();
  }, [fhevmStatus, setFhevmStatus, setFhevmError]);

  // Reset game on disconnect
  useEffect(() => {
    if (!isConnected) {
      resetGame();
    }
  }, [isConnected, resetGame]);

  const scrollToGame = () => {
    document.getElementById("game")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4">
      {/* Title */}
      <h1 className="font-heading font-black text-6xl md:text-8xl lg:text-9xl text-center mb-4 gradient-text drop-shadow-[0_0_30px_rgba(255,0,255,0.6)]">
        PLANET
        <br />
        BOUNCE
      </h1>

      {/* Tagline */}
      <p className="font-mono text-lg md:text-xl text-chrome/70 text-center mb-12 max-w-2xl">
        &gt; ENCRYPTED COSMIC GUESSING GAME
        <br />
        <span className="text-neon-cyan">&gt; POWERED BY FHE</span>
      </p>

      {/* Connect Button or Start */}
      <div className="flex flex-col items-center gap-6">
        {!isConnected ? (
          <div className="transform -skew-x-12 hover:skew-x-0 transition-transform duration-200">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="px-10 py-4 bg-transparent border-2 border-neon-cyan text-neon-cyan font-heading text-lg uppercase tracking-wider hover:bg-neon-cyan hover:text-void hover:shadow-neon-cyan transition-all duration-200 skew-x-12"
                >
                  CONNECT WALLET
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        ) : (
          <button
            onClick={scrollToGame}
            disabled={fhevmStatus !== "ready"}
            className={`
              px-10 py-4 font-heading text-lg uppercase tracking-wider
              border-2 border-neon-magenta
              transition-all duration-200
              ${fhevmStatus === "ready"
                ? "text-neon-magenta hover:bg-neon-magenta hover:text-void hover:shadow-neon-magenta animate-pulse-glow"
                : "opacity-50 cursor-not-allowed text-chrome/50"
              }
            `}
          >
            {fhevmStatus === "ready" ? "▼ ENTER THE VOID ▼" : "LOADING FHE..."}
          </button>
        )}

        {/* FHE Status Indicator */}
        <div className="font-mono text-sm">
          {fhevmStatus === "initializing" && (
            <span className="text-neon-orange animate-pulse">
              ◉ INITIALIZING ENCRYPTION ENGINE...
            </span>
          )}
          {fhevmStatus === "ready" && (
            <span className="text-neon-cyan">
              ◉ FULLY HOMOMORPHIC ENCRYPTION: ACTIVE
            </span>
          )}
          {fhevmStatus === "error" && (
            <span className="text-red-500">
              ◉ FHE ENGINE OFFLINE
            </span>
          )}
        </div>
      </div>

    </section>
  );
}

