import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#090014",
        chrome: "#E0E0E0",
        card: "rgba(26, 16, 60, 0.8)",
        neon: {
          magenta: "#FF00FF",
          cyan: "#00FFFF",
          orange: "#FF9900",
        },
        border: {
          default: "#2D1B4E",
          active: "#00FFFF",
        },
      },
      fontFamily: {
        heading: ["Orbitron", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "grid-flow": "gridFlow 20s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.7", filter: "brightness(1.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gridFlow: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "40px 40px" },
        },
      },
      boxShadow: {
        "neon-magenta": "0 0 20px #FF00FF, 0 0 40px #FF00FF",
        "neon-cyan": "0 0 20px #00FFFF, 0 0 40px #00FFFF",
        "neon-orange": "0 0 20px #FF9900, 0 0 40px #FF9900",
      },
      dropShadow: {
        "neon-magenta": "0 0 10px #FF00FF",
        "neon-cyan": "0 0 10px #00FFFF",
      },
    },
  },
  plugins: [],
};

export default config;

