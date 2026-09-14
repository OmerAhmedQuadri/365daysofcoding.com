import typography from '@tailwindcss/typography';
import { colors } from './src/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,mjs}',
  ],
  theme: {
    extend: {
      colors,
      // Markdown (ConceptPanel) uses plain `prose`; these map its colors to the theme
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': colors.fg.muted,
            '--tw-prose-headings': colors.fg.DEFAULT,
            '--tw-prose-lead': colors.fg.muted,
            '--tw-prose-links': colors.brand[400],
            '--tw-prose-bold': colors.fg.DEFAULT,
            '--tw-prose-counters': colors.fg.subtle,
            '--tw-prose-bullets': colors.line.strong,
            '--tw-prose-hr': colors.line.DEFAULT,
            '--tw-prose-quotes': colors.fg.DEFAULT,
            '--tw-prose-quote-borders': colors.brand[500],
            '--tw-prose-captions': colors.fg.subtle,
            '--tw-prose-code': colors.brand[300],
            '--tw-prose-pre-code': colors.fg.DEFAULT,
            '--tw-prose-pre-bg': colors.canvas,
            '--tw-prose-th-borders': colors.line.strong,
            '--tw-prose-td-borders': colors.line.DEFAULT,
          },
        },
      },
    },
  },
  plugins: [typography],
};
