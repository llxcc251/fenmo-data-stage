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
        'ink-drift-1': 'inkDrift1 35s ease-in-out infinite',
        'ink-drift-2': 'inkDrift2 40s ease-in-out infinite',
        'ink-drift-3': 'inkDrift3 30s ease-in-out infinite',
        'ink-drift-4': 'inkDrift4 45s ease-in-out infinite',
        'dust-float': 'dustFloat 8s linear infinite',
        'spotlight-sweep': 'spotlightSweep 25s ease-in-out infinite',
      },
      keyframes: {
        inkDrift1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(40px, -60px) scale(1.1)' },
          '50%': { transform: 'translate(-30px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(50px, 40px) scale(1.05)' },
        },
        inkDrift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-50px, 40px) scale(0.95)' },
          '50%': { transform: 'translate(30px, -50px) scale(1.15)' },
          '75%': { transform: 'translate(-40px, -20px) scale(1)' },
        },
        inkDrift3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1) rotate(5deg)' },
          '66%': { transform: 'translate(-20px, 30px) scale(0.9) rotate(-5deg)' },
        },
        inkDrift4: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(-35px, -30px) scale(0.9) rotate(-3deg)' },
          '66%': { transform: 'translate(45px, 25px) scale(1.1) rotate(3deg)' },
        },
        dustFloat: {
          '0%': { transform: 'translateY(100vh) translateX(0px)', opacity: '0' },
          '10%': { opacity: '0.4' },
          '90%': { opacity: '0.4' },
          '100%': { transform: 'translateY(-10vh) translateX(20px)', opacity: '0' },
        },
        spotlightSweep: {
          '0%, 100%': { transform: 'translate(-20%, -10%) scale(1)', opacity: '0.5' },
          '25%': { transform: 'translate(10%, 5%) scale(1.15)', opacity: '0.8' },
          '50%': { transform: 'translate(20%, -5%) scale(0.9)', opacity: '0.4' },
          '75%': { transform: 'translate(-10%, 10%) scale(1.05)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
