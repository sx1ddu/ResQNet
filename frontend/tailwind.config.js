/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#101B2A',
          900: '#142437',
          800: '#1E3044',
          700: '#2C4055',
          600: '#3D546C',
        },
        blue: {
          900: '#153378',
          800: '#1C429E',
          700: '#2457C5',
          600: '#3D72E5',
          100: '#E8F0FF',
          50: '#F3F7FF',
        },
        coral: {
          900: '#7C3028',
          800: '#A53C2F',
          700: '#C94B3C',
          600: '#E06254',
          100: '#FCEBE8',
          50: '#FDF4F2',
        },
        teal: {
          900: '#0F4D46',
          800: '#14635B',
          700: '#19796F',
          600: '#229E92',
          100: '#E4F3F0',
          50: '#F2FAF8',
        },
        amber: {
          900: '#684206',
          800: '#7F5208',
          700: '#98620A',
          600: '#C28A28',
          100: '#FBF1D8',
          50: '#FDF9EC',
        },
        paper: '#F6F7F5',
        surface: '#FFFFFF',
        line: '#DCE2E7',
        'line-dark': '#2A4055',
        slate: {
          900: '#172433',
          800: '#2A3B4C',
          700: '#415263',
          600: '#5D6B78',
          500: '#788694',
          400: '#98A4B0',
          300: '#BDC7D1',
          200: '#DCE2E7',
          100: '#EDF1F4',
          50: '#F6F8F9',
        },
        surfaceDark: {
          DEFAULT: '#142437',
          panel: '#1B2D40',
          raised: '#203247',
          highlight: '#25394C',
          border: '#33485D',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        panel: '10px',
        control: '8px',
        badge: '4px',
      },
      boxShadow: {
        panel: '0 8px 24px rgba(16, 27, 42, 0.06)',
        dropdown: '0 12px 32px rgba(16, 27, 42, 0.12)',
        modal: '0 24px 48px rgba(16, 27, 42, 0.20)',
        preview: '0 24px 50px rgba(22, 40, 58, 0.18)',
      },
      animation: {
        pulseBeacon: 'pulseBeacon 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseBeacon: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
};
