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
          50: '#faf7f2',
          100: '#f2ece3',
          200: '#e3d9ca',
          300: '#cabaa4',
          400: '#a8957d',
          500: '#7c6d5b',
          600: '#5e5244',
          700: '#473d33',
          800: '#312a23',
          900: '#1f1a15',
        },
        surface: {
          DEFAULT: '#fffdf8',
          2: '#fffaf1',
          3: '#f1e7d8',
        },
        border: '#dccfb9',
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
