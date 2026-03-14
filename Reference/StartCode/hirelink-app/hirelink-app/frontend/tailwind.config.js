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
          50: '#f0f7fa',
          100: '#d9eaf2',
          200: '#b3d5e6',
          300: '#8dc0d9',
          400: '#67abcc',
          500: '#4a90a4',
          600: '#2e5984',
          700: '#1e3a5f',
          800: '#162b47',
          900: '#0e1c2f',
        },
        accent: {
          50: '#fef7ee',
          100: '#fcedd8',
          200: '#f8d6b0',
          300: '#f3bc7e',
          400: '#ed974a',
          500: '#e87a25',
          600: '#d9611b',
          700: '#b44918',
          800: '#903b1b',
          900: '#743319',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
