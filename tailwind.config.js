/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hanzi: [
          'Noto Serif CJK SC',
          'Noto Serif SC',
          'Source Han Serif SC',
          'STSong',
          'SimSun',
          'serif',
        ],
        ui: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        gray: {
          50: '#fffdf8',
          100: '#f8f2e8',
          200: '#3b342d',
          300: '#4a433d',
          400: '#5e564f',
          500: '#756c64',
          600: '#8e857d',
          700: '#b6aea6',
          800: '#d7d0c7',
          900: '#efe9e1',
        },
        surface: {
          DEFAULT: '#fffdf8',
          2: '#fffaf1',
          3: '#efe8da',
        },
        border: '#ddd2bf',
        hanzi: '#c27a12',
        pinyin: '#2563eb',
        vi: '#15803d',
        en: '#4f46e5',
      },
      animation: {
        'flip-in': 'flipIn 0.35s ease-out',
        'flip-out': 'flipOut 0.35s ease-in',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        flipIn: {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        flipOut: {
          '0%': { transform: 'rotateY(0deg)', opacity: '1' },
          '100%': { transform: 'rotateY(-90deg)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
