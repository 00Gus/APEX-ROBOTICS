/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aerospace: {
          900: '#0B0F17', // Fondo principal mate profundo y sólido
          800: '#131A26', // Superficie sólida de tarjetas y paneles
          700: '#1A2332', // Superficies elevadas y hover
          600: '#243044', // Bordes y separadores activos
          500: '#32425C',
        },
        titanium: {
          900: '#0F1520',
          800: '#161F2E', // Fondo sólido para botones y wells secundarios
          700: '#1F2A3D',
          600: '#2A3852',
          500: '#3D4F6F',
        },
        steel: {
          border: '#222C3E', // Borde sólido y sutil
          muted: '#94A3B8',  // Texto secundario legible y descansado
          light: '#F1F5F9',  // Texto principal de alto contraste
        },
        safety: {
          orange: '#EA580C',      // Naranja industrial sólido (RAL 2004 mate)
          orangeHover: '#C2410C', // Hover sólido
          yellow: '#D97706',
        },
        cobalt: {
          500: '#2563EB',
          400: '#38BDF8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      }
    },
  },
  plugins: [],
}
