import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://victoriapiquer.me',
  base: '/',

  vite: {
    plugins: [tailwindcss()],
  },
});