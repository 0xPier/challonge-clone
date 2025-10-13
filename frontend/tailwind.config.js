/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        indigo: {
          950: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 30px 60px -15px rgba(6, 182, 212, 0.35)',
        subtle: '0 18px 40px -20px rgba(15, 23, 42, 0.65)',
      },
      backgroundImage: {
        'hero-splash':
          'radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.2), transparent 50%), linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85))',
        'subtle-grid':
          'linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
      },
      spacing: {
        18: '4.5rem',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
