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
          "20%, 24%, 55%": { opacity: "0.85" },
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
      },
      animation: {
        flicker: "flicker 6s infinite",
        scanline: "scanline 6s linear infinite",
        floaty: "floaty 4s ease-in-out infinite",
        glowpulse: "glowpulse 4s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
      },
    },
  },
  plugins: [],
};
