/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C8102E',
          hover: '#A00C24',
          light: '#E6002B',
          50: '#FFF0F2',
          100: '#FFE1E5',
          200: '#FFC7CE',
          300: '#FFA0AC',
          600: '#C8102E',
          700: '#A00C24',
          800: '#800016',
        }
      }
    },
  },
  plugins: [],
}
