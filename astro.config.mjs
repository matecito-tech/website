// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://matecito.qzz.io';
const BUILD_DATE = new Date().toISOString();

export default defineConfig({
  site: SITE,
  base: '/',
  trailingSlash: 'always',
  output: 'static',
  compressHTML: true,
  build: {
    // CSS inline (≈18 KB): sin hojas de estilo que bloqueen el primer pintado
    inlineStylesheets: 'always',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  // Fuentes autoalojadas vía Fonts API: preload automático y fuentes de
  // respaldo con métricas ajustadas (size-adjust) => casi cero CLS al cargar.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: { variants: [{ src: ['./src/assets/fonts/Manrope.woff2'], weight: '300 800', style: 'normal', display: 'swap' }] },
    },
    {
      provider: fontProviders.local(),
      name: 'Space Grotesk',
      cssVariable: '--font-space-grotesk',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: { variants: [{ src: ['./src/assets/fonts/SpaceGrotesk.woff2'], weight: '500 700', style: 'normal', display: 'swap' }] },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: { variants: [{ src: ['./src/assets/fonts/JetBrainsMono.woff2'], weight: '400', style: 'normal', display: 'swap' }] },
    },
  ],

  // Navegación instantánea: los enlaces internos se precargan al entrar en
  // pantalla y Chrome los pre-renderiza con Speculation Rules.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  markdown: {
    syntaxHighlight: false,
  },

  image: {
    responsiveStyles: true,
  },

  // Content-Security-Policy con hashes de cada script y estilo (meta tag),
  // válida en un hosting estático como GitHub Pages.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        // Cloudflare Web Analytics (sin cookies) lo inyecta el proxy de Cloudflare
        "img-src 'self' data: https://www.afip.gob.ar",
        "font-src 'self'",
        "connect-src 'self' https://dolarapi.com https://cloudflareinsights.com https://challenges.cloudflare.com",
        // Turnstile (anti-bots de los formularios)
        'frame-src https://challenges.cloudflare.com',
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "manifest-src 'self'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: ["'self'", 'https://static.cloudflareinsights.com', 'https://challenges.cloudflare.com'],
      },
      styleDirective: {
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },

  experimental: {
    clientPrerender: true,
    chromeDevtoolsWorkspace: true,
  },

  integrations: [
    sitemap({
      // /gracias/ es la confirmación de envío (noindex): no va al sitemap
      filter: (page) => !page.includes('/gracias'),
      serialize(item) {
        item.lastmod = BUILD_DATE;
        if (item.url === `${SITE}/`) {
          item.priority = 1;
          item.changefreq = 'weekly';
        } else {
          item.priority = 0.3;
          item.changefreq = 'yearly';
        }
        return item;
      },
    }),
  ],
});
