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
          fg: "#ffffff",
          muted: "#e7f2ea",
        },
      },
    },
  },
  plugins: [],
};

export default config;
