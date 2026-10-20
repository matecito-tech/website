import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://matecito.qzz.io',
  base: '/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});