/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f7ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#7fbaeb',
          400: '#3b82c4',
          500: '#004370',
          600: '#003660',
          700: '#002a4d',
          800: '#001e39',
          900: '#001326',
          950: '#000a17',
        },
        surface: {
          DEFAULT: '#f7fafc',
          dark:    '#edf2f7',
          darker:  '#e2e8f0',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card:    '0 1px 4px rgba(0,67,112,0.06), 0 4px 16px rgba(0,67,112,0.04)',
        'card-lg': '0 4px 24px rgba(0,67,112,0.10), 0 1px 4px rgba(0,67,112,0.06)',
        navy:    '0 0 0 2px rgba(0,67,112,0.25)',
      },
      animation: {
        'fade-in':  'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
