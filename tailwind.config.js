/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        midnight: {
          950: "#04060c",
          900: "#070a14",
          800: "#0c1020",
          700: "#11172c",
          600: "#1a2240",
          500: "#243056",
        },
        msn: {
          green: "#7ce86a",
          orange: "#ffae3b",
          blue: "#7aa7ff",
          violet: "#c4b5fd",
          cyan: "#7dd3fc",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(122,167,255,.18)",
        "glow-lg": "0 0 80px rgba(122,167,255,.25)",
        crt: "inset 0 0 80px rgba(0,0,0,.6), 0 0 60px rgba(122,167,255,.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.88" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glowpulse: {
          "0%, 100%": { boxShadow: "0 0 30px rgba(122,167,255,.18)" },
          "50%": { boxShadow: "0 0 60px rgba(122,167,255,.34)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.015)" },
        },
        "noise-drift": {
          "0%":   { transform: "translate(0,0)" },
          "20%":  { transform: "translate(-1px, 1px)" },
          "40%":  { transform: "translate(1px,-1px)" },
          "60%":  { transform: "translate(-1px, 0px)" },
          "80%":  { transform: "translate(1px, 1px)" },
          "100%": { transform: "translate(0, 0)" },
        },
        "glow-text": {
          "0%, 100%": { textShadow: "0 0 18px rgba(186,230,253,.25)" },
          "50%":       { textShadow: "0 0 40px rgba(186,230,253,.55), 0 0 80px rgba(186,230,253,.2)" },
        },
        "scanline-flow": {
          "0%":   { transform: "translateY(-100vh)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "era-shift": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.92" },
        },
        "nav-glow-in": {
          "0%":   { boxShadow: "inset 3px 0 0 transparent" },
          "100%": { boxShadow: "inset 3px 0 0 var(--era-accent)" },
        },
        "float-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        flicker: "flicker 8s infinite",
        scanline: "scanline 6s linear infinite",
        floaty: "floaty 4s ease-in-out infinite",
        glowpulse: "glowpulse 4s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
        breathe: "breathe 7s ease-in-out infinite",
        "noise-drift": "noise-drift 0.18s steps(1) infinite",
        "glow-text": "glow-text 4s ease-in-out infinite",
        "scanline-flow": "scanline-flow 10s linear infinite",
        "era-shift": "era-shift 6s ease-in-out infinite",
        "float-up": "float-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
