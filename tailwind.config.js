/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1f1f1f',
          950: '#0a0a0a',
        }
      },
      animation: {
        'hero-zoom': 'heroZoom 20s ease-in-out infinite',
        'light-ray': 'lightRay 8s ease-in-out infinite',
        'light-ray-delayed': 'lightRay 8s ease-in-out infinite 4s',
      },
      keyframes: {
        heroZoom: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        lightRay: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1) translate(0, 0)' },
          '50%': { opacity: '0.6', transform: 'scale(1.2) translate(20px, -20px)' },
        },
      },
    },
  },
  plugins: [],
};
