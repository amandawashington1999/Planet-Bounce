import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Planet Bounce",
  projectId: "b5e4e3c5e9e7e4e3c5e9e7e4e3c5e9e7",
  chains: [sepolia],
  ssr: true,
});

export const CONTRACT_ADDRESS = "0x3F872727a21645c50Db9E1B949B09a4f385d6f80" as `0x${string}`;

export const CONTRACT_ABI = [
  {
    name: "play",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "encryptedGuess", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "getResultHandle",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

export const PLANETS = [
  { id: 0, name: "Mercury", emoji: "☿", color: "#B5B5B5" },
  { id: 1, name: "Venus", emoji: "♀", color: "#E6C229" },
  { id: 2, name: "Earth", emoji: "🌍", color: "#6B93D6" },
  { id: 3, name: "Mars", emoji: "♂", color: "#C1440E" },
  { id: 4, name: "Jupiter", emoji: "♃", color: "#D8CA9D" },
  { id: 5, name: "Saturn", emoji: "♄", color: "#E4D191" },
  { id: 6, name: "Uranus", emoji: "⛢", color: "#D1E7E7" },
  { id: 7, name: "Neptune", emoji: "♆", color: "#5B5DDF" },
] as const;

