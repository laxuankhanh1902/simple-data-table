/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        dark: {
          bg: {
            primary: '#141414',
            secondary: '#1f1f1f',
            tertiary: '#262626',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a6a6a6',
            tertiary: '#8c8c8c',
          },
          border: '#434343',
        }
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}