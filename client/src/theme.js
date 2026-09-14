// Single source of truth for the app's colors: neutral dark greys with a green accent.
// Tailwind reads these in tailwind.config.js (bg-canvas, text-fg-muted, bg-brand-500, ...)
// and CodeEditor.jsx uses them for the CodeMirror theme.
export const colors = {
  // Backgrounds, darkest to lightest (neutral grey, no tint)
  canvas: '#0a0a0a',   // page background, code editor
  surface: '#141414',  // cards, navbar, panels
  raised: '#1c1c1c',   // inputs, hover states, skeleton loaders
  line: {
    DEFAULT: '#262626', // borders, dividers, progress tracks
    strong: '#333333',  // input borders, emphasised dividers
  },
  fg: {
    DEFAULT: '#ededed', // headings, primary text
    muted: '#a3a3a3',   // body and secondary text
    subtle: '#858585',  // meta text, icons, placeholders (5:1 on surface)
  },
  // Accent: Tailwind's green scale. Use dark text (brand-950) on brand-500/400 fills.
  brand: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
};
