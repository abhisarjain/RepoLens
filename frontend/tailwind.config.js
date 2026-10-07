/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#090b10",
          900: "#0d1017",
          850: "#11151e",
          800: "#171c27",
          700: "#252c3a",
        },
        lens: {
          300: "#9de7ff",
          400: "#5ed2f5",
          500: "#21b8e6",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      boxShadow: {
        node: "0 18px 55px rgba(0, 0, 0, .34), inset 0 1px 0 rgba(255,255,255,.045)",
      },
    },
  },
  plugins: [],
};
