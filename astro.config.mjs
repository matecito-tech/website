import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://matecito.qzz.io',
  base: '/',
  trailingSlash: 'always',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap({
    // /gracias/ es pagina de confirmacion (noindex) -> no va en el sitemap
    filter: (page) => !page.includes('/gracias'),
  })],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});