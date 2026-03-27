/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#CCA34A",         // Anvora Gold (Buttons/Accents)
        "deep-green": "#0F4C3A",      // Dark Emerald Green (Primary Brand Color)
        "light-green": "#E6F4EA",     // Very Pale Mint (Section Backgrounds)
        "off-white": "#FDFBF7",       // Soft Cream (Hero Background)
        "background-light": "#FFFFFF", // Pure White
        "background-dark": "#1A1E2E",  // Deep Navy/Charcoal (Footer)
      },
      fontFamily: {
        // Changed to Serif for that "University/Premium" look
        "display": ["Merriweather", "Playfair Display", "serif"], 
        "body": ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 76, 58, 0.1)',
      }
    },
  },
  plugins: [],
}