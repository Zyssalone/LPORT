/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0E1113", // <--- custom color
      },
      // Adding smooth scrolling as a utility class
      scrollBehavior: ['responsive', 'hover', 'focus'], // Optional: makes it responsive to hover/focus
    },
  },
  plugins: [],
};
