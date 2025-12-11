/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary
        'tabiya-green': '#00FF91',
        'tabiya-green-hover': '#00E682',
        'tabiya-gray': '#F8F5F0',

        // Secondary
        'soft-green': '#E4F8E2',
        'green-2': '#26B87D',
        'green-3': '#247066',
        'oxford-blue': '#002147',

        // Extended
        'light-green': '#D7FFEF',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.4' }],
        xl: ['24px', { lineHeight: '1.3' }],
        '2xl': ['32px', { lineHeight: '1.2' }],
        '3xl': ['48px', { lineHeight: '1.1' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0,0,0,0.05)',
        elevated: '0 4px 12px rgba(0,0,0,0.1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      maxWidth: {
        content: '1280px',
        wide: '1400px',
      },
    },
  },
  plugins: [],
};
