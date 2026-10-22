# Matecito Tech · sitio web

Sitio de **Matecito Tech** (https://matecito.qzz.io): páginas web, tiendas online y software a medida desde Humboldt, Santa Fe.

## Stack

- **Astro 7** estático: Fonts API, CSP con hashes, prefetch + prerender (Speculation Rules), content collections, View Transitions nativas entre páginas.
- **Tailwind CSS 4** (tokens OKLCh en `src/styles/global.css`).
- JavaScript vanilla, sin framework de UI. El asistente se descarga recién al abrirlo.
- **bun** como gestor de paquetes y runner.

## Estructura

```
src/
├── data/site.ts             # Única fuente de verdad: contacto, WhatsApp, precios, datos fiscales
├── content/legal/*.md       # Términos y privacidad (content collection, validada con zod)
├── content.config.ts
├── pages/
│   ├── index.astro          # Home: hero, historia, servicios, caso, proceso, precios, nosotros, FAQ, contacto
│   ├── [legal].astro        # /terminos/ y /politica-de-privacidad/ desde la colección
│   ├── arrepentimiento.astro# Botón de arrepentimiento y baja (Res. 424/2020, art. 10 ter Ley 24.240)
│   └── gracias.astro
├── layouts/Layout.astro     # <head> SEO (JSON-LD @graph), nav, footer legal, dock, asistente
├── components/
│   ├── Logo.astro           # Símbolo vectorial (mate): verde sobre claro, blanco sobre oscuro, sin placa
│   ├── Assistant.astro      # Asistente de ventas (UI)
│   ├── Ronda.astro          # Gamificación "La ronda de mate" + dock mobile
│   ├── CodeBlock.astro, IconSprite.astro
├── scripts/
│   ├── main.js              # Nav, tema (View Transitions), precios en pesos, formulario
│   ├── assistant.js         # Motor del asistente (IA local del navegador o intents locales)
│   └── ronda.js             # Logros de la ronda de mate
└── assets/                  # Imágenes, SVG del hero (animados) y fuentes WOFF2
tests/sitio.spec.ts          # Playwright + axe (escritorio y mobile)
lighthouserc.json            # Presupuestos de Lighthouse para CI
```

## Comandos

```bash
bun install
bun run dev          # desarrollo
bun run build        # build -> dist/
bun run preview      # sirve dist/
bun run test         # html-validate + eslint + astro check + contraste
bun run test:e2e     # Playwright + axe (requiere `bunx playwright install chromium`)
```

## CI/CD (`.github/workflows/ci.yml`)

En cada push y PR: tipos, lint, contraste WCAG/APCA, build, validación HTML, presupuesto de peso, E2E + accesibilidad (Playwright + axe), Lighthouse con umbrales y enlaces rotos (lychee). En `main`, si todo pasa, deploy a GitHub Pages. Las acciones están fijadas por SHA y Dependabot las actualiza cada semana junto con las dependencias.

## Pendientes del negocio

Completar en `src/data/site.ts` (se muestran solos al cargarlos):

- `legalName`, `cuit` y `address`: identificación del proveedor (Ley 24.240, art. 4; CCyC, art. 1100).
- `dataFiscalUrl`: QR de Data Fiscal de ARCA.
