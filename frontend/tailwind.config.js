/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fbf8f2",
          100: "#f2ece0",
          400: "#b08d57",
          700: "#4a3f30",
          900: "#2b2620"
        }
      }
    }
  },
  plugins: []
};
