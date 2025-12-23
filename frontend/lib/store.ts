import { create } from "zustand";

export type FhevmStatus = "idle" | "initializing" | "ready" | "error";
export type GamePhase = 
  | "idle"           // Ready to select planet
  | "selecting"      // User is selecting planet
  | "encrypting"     // Encrypting + submitting
  | "decrypting"     // Ready to decrypt (show button)
  | "result";        // Showing result

interface GameStore {
  fhevmStatus: FhevmStatus;
  fhevmError: string | null;
  setFhevmStatus: (status: FhevmStatus) => void;
  setFhevmError: (error: string | null) => void;
  gamePhase: GamePhase;
  selectedPlanet: number | null;
  gameResult: boolean | null;
  statusMessage: string | null;
  setGamePhase: (phase: GamePhase) => void;
  setSelectedPlanet: (planet: number | null) => void;
  setGameResult: (result: boolean | null) => void;
  setStatusMessage: (message: string | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  fhevmStatus: "idle",
  fhevmError: null,
  setFhevmStatus: (status) => set({ fhevmStatus: status }),
  setFhevmError: (error) => set({ fhevmError: error }),
  gamePhase: "idle",
  selectedPlanet: null,
  gameResult: null,
  statusMessage: null,
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  setGameResult: (result) => set({ gameResult: result }),
  setStatusMessage: (message) => set({ statusMessage: message }),
  resetGame: () => set({
    gamePhase: "idle",
    selectedPlanet: null,
    gameResult: null,
    statusMessage: null,
  }),
}));

