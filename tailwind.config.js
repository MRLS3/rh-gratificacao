/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      colors: {
        forest: {
          50:  '#f0f7f1',
          100: '#d9eedd',
          200: '#b3ddb9',
          300: '#7dc48a',
          400: '#4da85e',
          500: '#2b8a3e',
          600: '#1e6b2f',
          700: '#175224',
          800: '#123d1c',
          900: '#0c2a13',
          950: '#071a0c',
        },
        cream: {
          50:  '#faf9f7',
          100: '#f3f0ea',
          200: '#e8e2d5',
          300: '#d9d0bf',
          400: '#c4b89e',
        }
      }
    },
  },
  plugins: [],
};
