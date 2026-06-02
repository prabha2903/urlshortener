/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Display font for headings
        display: ['Syne', 'sans-serif'],
        // Body font for general text
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        // Brand color palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Dark surface colors
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          800: '#0f1117',
          850: '#0a0c12',
          900: '#060810',
          950: '#030407',
        },
        surface: {
          1: '#13161f',
          2: '#1a1d2a',
          3: '#20243a',
          4: '#272b42',
        },
        // Accent colors
        accent: {
          cyan:   '#06b6d4',
          violet: '#8b5cf6',
          rose:   '#f43f5e',
          amber:  '#f59e0b',
          emerald:'#10b981',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-card':  'linear-gradient(145deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
        'gradient-glow':  'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'brand':  '0 0 30px rgba(99,102,241,0.25)',
        'card':   '0 4px 24px rgba(0,0,0,0.4)',
        'glow':   '0 0 60px rgba(99,102,241,0.15)',
        'inner-brand': 'inset 0 0 0 1px rgba(99,102,241,0.3)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'slide-in':   'slideIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};