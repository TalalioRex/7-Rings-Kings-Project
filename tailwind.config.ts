import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#070812",
        ink: "#0e1020",
        neonPink: "#ff4fd8",
        neonCyan: "#40f5ff",
        neonGreen: "#5bffb5",
        warningRed: "#ff4764"
      },
      boxShadow: {
        neon: "0 0 28px rgba(64, 245, 255, 0.28)",
        wild: "0 0 28px rgba(255, 71, 100, 0.42)",
        scatter: "0 0 34px rgba(91, 255, 181, 0.5)"
      }
    }
  },
  plugins: []
};

export default config;
