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
          50: '#f0f4ff',
          100: '#dce6ff',
          200: '#bfd2fe',
          300: '#93b4fd',
          400: '#608cf9',
          500: '#3b67f1',
          600: '#254ce5',
          700: '#1d39cc',
          800: '#1e3a8a', // Stitch primary academic navy/indigo
          900: '#00236f', // Stitch deep institutional navy
          950: '#0b163a',
        },
        slate: {
          850: '#131b2e', // Stitch on_background / on_surface
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
