/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'strava': {
          orange: '#FC5200',
          dark: '#1a1a1a',
          gray: '#2d2d2d',
        },
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
      },
      fontFamily: {
        'lobster': ['Lobster', 'cursive'],
        'sans': ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

