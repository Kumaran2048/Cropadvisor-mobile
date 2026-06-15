

/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        cream: '#F5F3EE',
        farmer: { DEFAULT: '#1B4332', dark: '#0F2A1F', light: '#2D5A43' },
        officer: { DEFAULT: '#1A5276', dark: '#0F3A52', light: '#2980B9' },
        admin: { DEFAULT: '#4A235A', dark: '#2F1640', light: '#6C3483' },
        gold: '#E8B84B',
        danger: '#C0392B',
        success: '#27AE60'
      },
      borderRadius: {
        card: '14px'
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        cardHover: '0 4px 16px rgba(0,0,0,0.1)'
      }
    },
  },
  plugins: [],
}

