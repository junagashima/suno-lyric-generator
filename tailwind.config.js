/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fde6e6',
          200: '#fbd1d1',
          300: '#f7a8a8',
          400: '#f17a7a',
          500: '#e74c3c',
          600: '#d1362b',
          700: '#ae2a21',
          800: '#912620',
          900: '#7a2822',
        },
      },
    },
  },
  plugins: [],
}