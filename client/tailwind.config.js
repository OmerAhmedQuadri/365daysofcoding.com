import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,mjs}',
  ],
  theme: {
    extend: {},
  },
  plugins: [typography],
};
