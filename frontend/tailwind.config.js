/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors (Blue - Main brand color)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',     // Main primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Secondary colors (Slate Gray)
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',     // Main secondary
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Accent colors (Amber - For highlights/CTAs)
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',     // Main accent
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
        'primary-lg': '0 10px 25px 0 rgba(37, 99, 235, 0.3)',
        'accent': '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
        'accent-lg': '0 10px 25px 0 rgba(245, 158, 11, 0.3)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        'gradient-primary-dark': 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
