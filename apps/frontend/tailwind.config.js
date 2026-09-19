import daisyui from 'daisyui';
import scrollbarHide from 'tailwind-scrollbar-hide';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui, scrollbarHide],
  daisyui: {
    themes: true,
  },
};
