import type { Config } from "tailwindcss";

/**
 * Despeja design tokens.
 * Calm + clear: cool off-white paper, a trustworthy blue, a warm accent,
 * and red/amber/green for deadline urgency.
 * Fonts: Bricolage Grotesque (headings), Public Sans (UI/body — the U.S.
 * government's own typeface), IBM Plex Mono (dates & small labels).
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f6f9",
        surface: "#ffffff",
        ink: "#1b1f27",
        muted: "#5c6573",
        line: "#e3e8ef",
        brand: {
          DEFAULT: "#2f5fb0",
          dark: "#244c92",
          light: "#eaf1fb",
        },
        accent: {
          DEFAULT: "#c07d1e",
          soft: "#f7edda",
        },
        // deadline urgency
        high: "#c0392b",
        mid: "#a8740f",
        low: "#2f7d52",
      },
      fontFamily: {
        sans: ['"Public Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,31,39,0.04), 0 8px 22px -14px rgba(27,31,39,0.20)",
        lift: "0 2px 6px rgba(27,31,39,0.06), 0 18px 38px -18px rgba(27,31,39,0.28)",
      },
      borderRadius: { xl2: "1.1rem" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.35s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
