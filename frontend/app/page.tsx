"use client";

import { StatusBar } from "@/components/StatusBar";
import { HeroSection } from "@/components/HeroSection";
import { GameSection } from "@/components/GameSection";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <StatusBar />
      <HeroSection />
      <GameSection />
    </main>
  );
}

