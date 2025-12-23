"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useGameStore } from "@/lib/store";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";
import { useState } from "react";

export function StatusBar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { fhevmStatus, fhevmError, resetGame } = useGameStore();
  const [copied, setCopied] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDisconnect = () => {
    resetGame();
    disconnect();
  };

  const getFhevmStatusColor = () => {
    switch (fhevmStatus) {
      case "ready":
        return "text-neon-cyan";
      case "initializing":
        return "text-neon-orange animate-pulse";
      case "error":
        return "text-red-500";
      default:
        return "text-chrome/50";
    }
  };

  const getFhevmStatusText = () => {
    switch (fhevmStatus) {
      case "ready":
        return "FHE: ONLINE";
      case "initializing":
        return "FHE: INIT...";
      case "error":
        return "FHE: ERROR";
      default:
        return "FHE: OFFLINE";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 md:gap-4 font-mono text-xs md:text-sm">
      {/* FHEVM Status */}
      <div
        className={`px-2 md:px-3 py-1.5 border border-current ${getFhevmStatusColor()}`}
        title={fhevmError || "FHEVM Status"}
      >
        {getFhevmStatusText()}
      </div>

      {/* Contract Address */}
      {CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
        <a
          href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block px-3 py-1.5 border border-neon-magenta/50 text-neon-magenta hover:border-neon-magenta hover:shadow-[0_0_10px_#FF00FF] transition-all"
        >
          📜 {truncateAddress(CONTRACT_ADDRESS)}
        </a>
      )}

      {/* Wallet Address */}
      {isConnected && address && (
        <button
          onClick={copyAddress}
          className="px-2 md:px-3 py-1.5 border border-neon-cyan/50 text-neon-cyan hover:border-neon-cyan hover:shadow-[0_0_10px_#00FFFF] transition-all"
          title="Click to copy"
        >
          {copied ? "✓ COPIED" : `👤 ${truncateAddress(address)}`}
        </button>
      )}

      {/* Disconnect Button */}
      {isConnected && (
        <button
          onClick={handleDisconnect}
          className="px-2 md:px-3 py-1.5 border border-red-500/50 text-red-500 hover:border-red-500 hover:bg-red-500/20 hover:shadow-[0_0_10px_#ef4444] transition-all"
          title="Disconnect wallet"
        >
          ✕
        </button>
      )}
    </div>
  );
}

