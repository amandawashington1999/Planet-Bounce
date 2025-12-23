"use client";

// Polyfill for FHE SDK (needs 'global' in browser)
if (typeof window !== "undefined") {
  (window as any).global = window;
  
  // Suppress known third-party SDK warnings that don't affect functionality
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  const suppressPatterns = [
    "Base Account SDK",
    "Cross-Origin-Opener-Policy",
    "Allowlist",
    "cloud.reown.com",
    "Circular dependency",
    "@react-native-async-storage",
    "Lit is in dev mode",
  ];
  
  console.error = (...args: any[]) => {
    const msg = args[0]?.toString() || "";
    if (!suppressPatterns.some(p => msg.includes(p))) {
      originalConsoleError.apply(console, args);
    }
  };
  
  console.warn = (...args: any[]) => {
    const msg = args[0]?.toString() || "";
    if (!suppressPatterns.some(p => msg.includes(p))) {
      originalConsoleWarn.apply(console, args);
    }
  };
}

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

// Custom RainbowKit theme for vaporwave aesthetic
const vaporwaveTheme = darkTheme({
  accentColor: "#00FFFF",
  accentColorForeground: "#090014",
  borderRadius: "none",
  fontStack: "system",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={vaporwaveTheme}
          modalSize="compact"
          locale="en"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

