import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0C0A08',
          surface: '#151210',
          elevated: '#1E1A16',
          overlay: '#26211C',
        },
        border: {
          subtle: '#2A2420',
          default: '#352E28',
          strong: '#453C34',
        },
        orange: {
          dim: '#8C3D10',
          base: '#C25A18',
          mid: '#D4691E',
          bright: '#E8832A',
          glow: '#F0A050',
          pale: '#F5C08A',
        },
        text: {
          primary: '#F5F0EB',
          secondary: '#9A8E84',
          muted: '#5C5248',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-btn': 'linear-gradient(135deg, #C25A18 0%, #E0782A 50%, #D4691E 100%)',
        'gradient-accent': 'linear-gradient(135deg, #8C3D10 0%, #C25A18 100%)',
        'gradient-card': 'linear-gradient(145deg, #1E1A16 0%, #151210 100%)',
      },
      animation: {
        'pulse-orange': 'pulseOrange 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 8px #C25A1830' },
          '50%': { boxShadow: '0 0 24px #C25A1860' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
