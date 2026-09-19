/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0B1F3A',
          800: '#123058',
          700: '#1B4477',
          600: '#265998',
        },
        brass: {
          100: '#F5EAC7',
          500: '#C9A227',
          600: '#A2811C',
        },
        paper: {
          0: '#FFFFFF',
          50: '#F6F5F1',
          100: '#EDEBE2',
          200: '#E1DDCF',
        },
        sage: {
          100: '#DCEAE3',
          500: '#3F6F5C',
        },
        rust: {
          100: '#F3DFDA',
          500: '#AE4F3B',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

