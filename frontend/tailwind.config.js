/** @type {import('tailwindcss').Config} */
// Tokens map 1:1 to DESIGN.md (Cohere 2026 system).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Brand uses tight, carved spacing — extend rather than replace defaults.
    extend: {
      colors: {
        primary: '#17171c',
        ink: '#212121',
        'deep-green': '#003c33',
        'dark-navy': '#071829',
        canvas: '#ffffff',
        'soft-stone': '#eeece7',
        'pale-green': '#edfce9',
        'pale-blue': '#f1f5ff',
        hairline: '#d9d9dd',
        'border-light': '#e5e7eb',
        'card-border': '#f2f2f2',
        muted: '#93939f',
        slate: '#75758a',
        'body-muted': '#616161',
        'action-blue': '#1863dc',
        'focus-blue': '#4c6ee6',
        coral: '#ff7759',
        'coral-soft': '#ffad9b',
        'form-focus': '#9b60aa',
        error: '#b30000',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Arial', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing }] — from DESIGN.md hierarchy.
        'hero-display': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'product-display': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'section-display': ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'section-heading': ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'card-heading': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'feature-heading': ['1.5rem', { lineHeight: '1.3' }],
        'body-large': ['1.125rem', { lineHeight: '1.4' }],
        body: ['1rem', { lineHeight: '1.5' }],
        button: ['0.875rem', { lineHeight: '1.71', fontWeight: '500' }],
        caption: ['0.875rem', { lineHeight: '1.4' }],
        'mono-label': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.28px' }],
        micro: ['0.75rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '22px',
        xl: '30px',
        pill: '32px',
      },
      spacing: {
        section: '80px',
      },
      maxWidth: {
        container: '1440px',
        prose: '72ch',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
}
