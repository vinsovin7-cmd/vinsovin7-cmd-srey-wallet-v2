/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          850: '#171c28',
          950: '#07090e'
        }
      }
    },
  },
  plugins: [],
}
