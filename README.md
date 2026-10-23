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
api/                         # Worker de formularios en Cloudflare (matecito.qzz.io/api/*)
├── src/index.ts             # Rutas /api/contacto, /api/arrepentimiento, /api/salud + monitor
├── src/emails.ts            # Plantillas de mail (HTML + texto)
├── src/smtp.ts              # Envío por SMTP de Gmail
└── cloudflare.config.ts     # Configuración del Worker (CLI `cf`)
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

## Formularios (`api/`)

Los formularios no usan servicios de terceros: los recibe un Worker propio en
Cloudflare que manda los mails por Gmail.

- **Contacto:** aviso a matecito.tech@gmail.com y confirmación al cliente.
- **Arrepentimiento y baja:** código de identificación en pantalla y constancia
  por mail al instante (Res. SCI 424/2020).
- **Anti-spam:** Turnstile, control de origen, campo trampa y rate limit
  (5 envíos cada 10 s por IP).
- **Monitor:** cada 30 minutos revisa el sitio y avisa por mail si no responde.

Secretos del Worker (nunca en el repo), cargados con la CLI `cf`:

| Secreto | Para qué |
|---|---|
| `GMAIL_APP_PASSWORD` | Contraseña de aplicación de Gmail (SMTP) |
| `TURNSTILE_SECRET` | Clave secreta del widget de Turnstile |

```bash
cd api
bun install
bunx cf deploy                                   # desplegar el Worker
cf workers secrets update GMAIL_APP_PASSWORD --worker matecito-formularios --type secret_text --text '...'
```

## Cloudflare

La zona `matecito.qzz.io` está en Cloudflare (plan gratuito):

- **Caché:** `/_astro/*` con 1 año (archivos con hash), Smart Tiered Cache, Always Online.
- **Seguridad:** Always Use HTTPS, HSTS (6 meses), TLS 1.2 mínimo, cabeceras
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y COOP (Transform Rule).
- **Correo:** Email Routing con `hola@matecito.qzz.io` reenviando a Gmail.
- **Analíticas:** Cloudflare Web Analytics (sin cookies).
- SSL en "Full" (no "Strict"): GitHub Pages no puede emitir certificado detrás del proxy.

## CI/CD (`.github/workflows/ci.yml`)

En cada push y PR: tipos, lint, contraste WCAG/APCA, build, validación HTML, presupuesto de peso (Brotli), E2E + accesibilidad (Playwright + axe), Lighthouse con umbrales y enlaces rotos (lychee). En `main`, si todo pasa, deploy a GitHub Pages. Las acciones están fijadas por SHA y Dependabot las actualiza cada semana junto con las dependencias.

Seguridad del repo: escaneo de secretos con protección de push, alertas y parches de Dependabot y CodeQL. Ver [SECURITY.md](SECURITY.md).

## Pendientes del negocio

Completar en `src/data/site.ts` (se muestran solos al cargarlos):

- `legalName`, `cuit` y `address`: identificación del proveedor (Ley 24.240, art. 4; CCyC, art. 1100).
- `dataFiscalUrl`: QR de Data Fiscal de ARCA.
