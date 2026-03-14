/**
 * HireLink Light Theme Color Palette
 * 
 * This file defines the application's color scheme for consistent styling.
 * Colors are designed for a professional, clean light theme.
 */

export const lightTheme = {
  // ============================================
  // Primary Colors (Blue - Main brand color)
  // ============================================
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',     // Main primary color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // ============================================
  // Secondary Colors (Slate Gray)
  // ============================================
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',     // Main secondary color
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // ============================================
  // Accent Colors (Amber - For highlights/CTAs)
  // ============================================
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',     // Main accent color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // ============================================
  // Background Colors
  // ============================================
  background: {
    primary: '#ffffff',      // Main background
    secondary: '#f8fafc',    // Page background
    tertiary: '#f1f5f9',     // Card/section backgrounds
    elevated: '#ffffff',     // Elevated elements (modals, dropdowns)
  },

  // ============================================
  // Text Colors
  // ============================================
  text: {
    primary: '#1e293b',      // Main text
    secondary: '#475569',    // Secondary text
    muted: '#94a3b8',        // Muted/placeholder text
    inverse: '#ffffff',      // Text on dark backgrounds
  },

  // ============================================
  // Status Colors
  // ============================================
  status: {
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#065f46',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#92400e',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#991b1b',
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#1e40af',
    },
  },

  // ============================================
  // Border Colors
  // ============================================
  border: {
    light: '#f1f5f9',
    default: '#e2e8f0',
    dark: '#cbd5e1',
  },

  // ============================================
  // Shadow Definitions
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    primary: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
    accent: '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
  },

  // ============================================
  // Booking Status Colors
  // ============================================
  bookingStatus: {
    pending: { bg: '#fef3c7', text: '#92400e' },
    confirmed: { bg: '#dbeafe', text: '#1e40af' },
    inProgress: { bg: '#e0e7ff', text: '#3730a3' },
    completed: { bg: '#d1fae5', text: '#065f46' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
  },

  // ============================================
  // Gradient Definitions
  // ============================================
  gradients: {
    primary: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    primaryDark: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    hero: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
    card: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  },
};

// Export color values for use in components
export const colors = lightTheme;

// CSS Custom Properties generator (for use in global styles)
export const generateCSSVariables = () => {
  return `
    :root {
      /* Primary */
      --color-primary-50: ${lightTheme.primary[50]};
      --color-primary-100: ${lightTheme.primary[100]};
      --color-primary-200: ${lightTheme.primary[200]};
      --color-primary-300: ${lightTheme.primary[300]};
      --color-primary-400: ${lightTheme.primary[400]};
      --color-primary-500: ${lightTheme.primary[500]};
      --color-primary-600: ${lightTheme.primary[600]};
      --color-primary-700: ${lightTheme.primary[700]};
      --color-primary-800: ${lightTheme.primary[800]};
      --color-primary-900: ${lightTheme.primary[900]};
      
      /* Secondary */
      --color-secondary-500: ${lightTheme.secondary[500]};
      --color-secondary-600: ${lightTheme.secondary[600]};
      
      /* Accent */
      --color-accent-500: ${lightTheme.accent[500]};
      --color-accent-600: ${lightTheme.accent[600]};
      
      /* Background */
      --bg-primary: ${lightTheme.background.primary};
      --bg-secondary: ${lightTheme.background.secondary};
      --bg-tertiary: ${lightTheme.background.tertiary};
      
      /* Text */
      --text-primary: ${lightTheme.text.primary};
      --text-secondary: ${lightTheme.text.secondary};
      --text-muted: ${lightTheme.text.muted};
      
      /* Border */
      --border-light: ${lightTheme.border.light};
      --border-default: ${lightTheme.border.default};
      --border-dark: ${lightTheme.border.dark};
    }
  `;
};

export default lightTheme;
