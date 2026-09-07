import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f6f3f",
          dark: "#17512e",
          fg: "#ffffff",
          muted: "#e7f2ea",
          subtle: "#f2f8f4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
