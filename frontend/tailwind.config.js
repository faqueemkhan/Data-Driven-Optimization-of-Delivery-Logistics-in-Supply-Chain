import colors from 'tailwindcss/colors';

// Shades backed by CSS variables so they can be swapped per theme (see src/index.css)
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const withThemedShades = (family, base, shades = [200, 300, 400, 950]) => ({
  ...base,
  ...Object.fromEntries(shades.map((s) => [s, themed(`${family}-${s}`)])),
});

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: themed('white'),
        // Always-white foreground for text/icons sitting on saturated accent backgrounds
        onaccent: '#ffffff',
        slate: withThemedShades('slate', colors.slate, [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        brand: withThemedShades('brand', {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }),
        amber: withThemedShades('amber', colors.amber),
        emerald: withThemedShades('emerald', colors.emerald),
        rose: withThemedShades('rose', colors.rose),
        indigo: withThemedShades('indigo', colors.indigo),
        green: withThemedShades('green', colors.green),
        teal: withThemedShades('teal', colors.teal),
        violet: withThemedShades('violet', colors.violet),
        blue: withThemedShades('blue', colors.blue),
      }
    },
  },
  plugins: [],
}
