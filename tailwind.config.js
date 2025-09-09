/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // B.Com Buddy palette
        midnight: '#0F0F1F',
        charcoal: '#181A24',
        gunmetal: '#2E2F36',
        neon: {
          teal: '#00FFD6',
          lime: '#A8FF00',
        },
        amber: '#FF9800',
        brand: {
          600: '#0F0F1F',
          700: '#181A24',
          800: '#2E2F36',
        },
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-teal': '0 0 10px rgba(0,255,214,0.6), 0 0 20px rgba(0,255,214,0.4)',
        'neon-lime': '0 0 10px rgba(168,255,0,0.6), 0 0 20px rgba(168,255,0,0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,255,214,0.4)' },
          '50%': { boxShadow: '0 0 16px rgba(0,255,214,0.7)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        glow: 'glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
