/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core brand palette
        pulse: {
          orange:    '#f97316',  // primary accent
          'orange-dim': '#c2550f', // hover / pressed
          'orange-glow': 'rgba(249,115,22,0.15)', // subtle bg tint
        },
        dark: {
          950: '#0a0a0b',   // deepest bg
          900: '#111113',   // page bg
          800: '#18181c',   // card bg
          700: '#222228',   // elevated card / input bg
          600: '#2e2e38',   // borders
          500: '#44444f',   // muted borders
          400: '#6b6b7a',   // placeholder text
          300: '#9898a8',   // secondary text
          200: '#c8c8d4',   // primary text muted
          100: '#e8e8f0',   // primary text
        }
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'slide-in':    'slideIn 0.3s ease forwards',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.85)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
      },
    },
  },
  plugins: [],
}
