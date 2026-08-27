/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5fc',
          100: '#e0ecf8',
          200: '#c2dbf2',
          300: '#94c1e9',
          400: '#5f9fdd',
          500: '#387fd0',
          600: '#2664b4',
          700: '#1e4f93',
          800: '#194279',
          900: '#0f2e5c', // New Era Royal Navy Blue
          950: '#0a1d3b',
        },
        gold: {
          50: '#faf7ed',
          100: '#f3ebd3',
          200: '#e7d6a5',
          300: '#d9bc70',
          400: '#caa346',
          500: '#b38a2e', // Academic Gold Accent
          600: '#9c7324',
          700: '#7d571f',
          800: '#68471f',
          900: '#573c1d',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
