import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        trace: {
          forest: "#0d3b2c",
          sage: "#2d5a45",
          mint: "#6b9b7a",
          cream: "#f5f0e8",
          sand: "#e8dfd0",
          stone: "#4a5568",
          teal: "#0d9488",
          amber: "#d97706",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(13, 59, 44, 0.06)",
        cardHover: "0 8px 24px rgba(13, 59, 44, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
