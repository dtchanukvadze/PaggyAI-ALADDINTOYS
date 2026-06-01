import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        magenta: {
          50:  '#fff0f9',
          100: '#ffe0f3',
          200: '#ffc2e8',
          300: '#ff94d4',
          400: '#ff55b8',
          500: '#ff1f9e',
          600: '#e8007d',
          700: '#c40065',
          800: '#a10054',
          900: '#870047',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fff3c4',
          200: '#ffe583',
          300: '#ffd042',
          400: '#ffbc0d',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Nunito', 'sans-serif'],
        body:    ['var(--font-body)', 'Noto Sans Georgian', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-pink': '0 8px 30px rgba(232, 0, 125, 0.3)',
        'glow-pink-lg': '0 8px 50px rgba(232, 0, 125, 0.4)',
        'glow-amber': '0 8px 30px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%':   { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
