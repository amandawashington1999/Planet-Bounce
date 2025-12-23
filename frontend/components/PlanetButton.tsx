"use client";

import { PLANETS } from "@/lib/wagmi";

interface PlanetButtonProps {
  planet: (typeof PLANETS)[number];
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function PlanetButton({
  planet,
  isSelected,
  isDisabled,
  onClick,
}: PlanetButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative group w-full py-5 md:py-6
        flex flex-col items-center justify-center gap-2
        border-2 transition-all duration-200 ease-linear
        backdrop-blur-sm bg-void/60
        ${
          isSelected
            ? "border-neon-magenta shadow-[0_0_30px_#FF00FF] scale-[1.03]"
            : "border-neon-cyan/30 hover:border-neon-cyan hover:shadow-[0_0_25px_#00FFFF]"
        }
        ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        active:scale-95
      `}
    >
      {/* Planet Glow Effect */}
      <div
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-200
          ${isSelected ? "opacity-30" : "group-hover:opacity-20"}
        `}
        style={{
          background: `radial-gradient(circle at center, ${planet.color}, transparent 70%)`,
        }}
      />

      {/* Planet Symbol */}
      <div
        className={`
          text-5xl md:text-6xl transition-transform duration-200
          ${isSelected ? "scale-110" : "group-hover:scale-110"}
        `}
        style={{
          filter: isSelected
            ? `drop-shadow(0 0 20px ${planet.color})`
            : `drop-shadow(0 0 12px ${planet.color})`,
        }}
      >
        {planet.emoji}
      </div>

      {/* Planet Name */}
      <span
        className={`
          font-heading text-sm md:text-base uppercase tracking-wider
          transition-all duration-200
          ${isSelected ? "text-neon-magenta" : "text-chrome/80 group-hover:text-neon-cyan"}
        `}
      >
        {planet.name}
      </span>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neon-magenta animate-pulse" />
      )}
    </button>
  );
}

