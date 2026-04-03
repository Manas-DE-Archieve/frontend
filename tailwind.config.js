/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#8b1a1a',
          600: '#7c1515',
          700: '#6b1010',
          900: '#450a0a',
        },
        gold: '#c8a84b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
