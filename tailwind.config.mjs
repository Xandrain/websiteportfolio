/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FBF9F4", // warm cream background
          deep: "#F1EEE6", // recessed panels
          contrast: "#E7E3D9",
        },
        ink: {
          DEFAULT: "#1B1A17", // warm near-black
          soft: "#3A3833",
          muted: "#8B877D",
        },
        line: "rgba(27, 26, 23, 0.10)",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.22em",
      },
      maxWidth: {
        editorial: "78rem",
        prose: "38rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,26,23,0.04), 0 14px 40px -16px rgba(27,26,23,0.14)",
        "soft-lg": "0 2px 6px rgba(27,26,23,0.05), 0 36px 70px -28px rgba(27,26,23,0.20)",
      },
      borderRadius: {
        bezel: "2rem",
      },
    },
  },
  plugins: [],
};
