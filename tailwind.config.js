/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a10',
          900: '#0b0f19',
          800: '#111827',
          700: '#1f293d',
          600: '#2d3b55',
        },
        cyber: {
          green: '#00ff66',
          cyan: '#00e5ff',
          amber: '#ffb000',
          red: '#ff3344',
          purple: '#b800ff',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Share Tech Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 12px rgba(0, 255, 102, 0.25)',
        'glow-cyan': '0 0 12px rgba(0, 229, 255, 0.25)',
        'glow-red': '0 0 12px rgba(255, 51, 68, 0.3)',
      }
    },
  },
  plugins: [],
}
