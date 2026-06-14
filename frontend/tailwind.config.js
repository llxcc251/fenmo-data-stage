/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FAF7F0',
          100: '#F0EBE0',
          200: '#E5DFD0',
          300: '#D5CEBC',
        },
        ink: {
          900: '#1A1A18',
          800: '#2A2A28',
          700: '#4A4A48',
          600: '#6B6B68',
          500: '#8A8A88',
        },
        vermillion: {
          900: '#7F1D1D',
          800: '#991B1B',
          700: '#B91C1C',
          600: '#DC2626',
          500: '#EF4444',
        },
        gold: {
          900: '#78350F',
          700: '#A16207',
          600: '#D97706',
          500: '#F59E0B',
          400: '#FBBF24',
        },
        indigo: {
          900: '#1E1B4B',
          700: '#3730A3',
          500: '#6366F1',
          400: '#818CF8',
        },
        jade: {
          100: '#F5F5F0',
          200: '#E5E5D8',
          300: '#D4D4C8',
        },
      },
      fontFamily: {
        title: ['"Noto Serif TC"', '"Noto Serif CJK SC"', '"Source Han Serif SC"', 'serif'],
        body: ['"Noto Sans TC"', '"Noto Sans CJK SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        number: ['Orbitron', '"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'curtain-open': 'curtainOpen 1.2s ease-out forwards',
        'curtain-close': 'curtainClose 0.8s ease-in forwards',
        'lantern-glow': 'lanternGlow 3s ease-in-out infinite',
        'stage-spotlight': 'spotlight 4s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'drum-beat': 'drumBeat 0.3s ease-out',
      },
      keyframes: {
        curtainOpen: {
          '0%': { transform: 'scaleY(1)', opacity: '1' },
          '100%': { transform: 'scaleY(0)', opacity: '0' },
        },
        curtainClose: {
          '0%': { transform: 'scaleY(0)', opacity: '0' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
        lanternGlow: {
          '0%, 100%': { filter: 'brightness(0.8) drop-shadow(0 0 4px #F59E0B)' },
          '50%': { filter: 'brightness(1.2) drop-shadow(0 0 12px #F59E0B)' },
        },
        spotlight: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drumBeat: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
