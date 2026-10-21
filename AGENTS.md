# Matecito Website — Skills & Best Practices

## Installed Skills

### SEO & AEO Best Practices
`sanity-io/agent-toolkit@seo-aeo-best-practices` (4.8K installs)
- Metadata, Open Graph, sitemaps, robots.txt, hreflang
- JSON-LD structured data (Article, FAQ, Breadcrumb, Product, Organization)
- EEAT (Experience, Expertise, Authoritativeness, Trustworthiness)
- AEO optimization for AI assistants (ChatGPT, Perplexity, AI Overviews)

### Web Quality Best Practices
`addyosmani/web-quality-skills@best-practices` (16.8K installs)
- Security: CSP, HSTS, SRI, Trusted Types, HTTPS
- Browser compatibility: doctype, charset, viewport, feature detection
- Deprecated APIs: no document.write, no sync XHR
- Code quality: valid/semantic HTML, image aspect ratios, error handling
- Performance: deferred scripts, event delegation, memory management

### Landing Page Design
`101-skills/skills@landing-page-design` (29.3K installs)
- Above-the-fold formula: headline, subheadline, hero image, CTA, social proof
- CTA psychology: action verb + value, high contrast, repeated placement
- Section order: Hero → Social Proof → Problem → Solution → How It Works → Testimonials → Pricing → FAQ → Final CTA
- Mobile optimization: full-width CTAs, 48x48 tap targets, min 16px font
- Form design: minimize fields, single-column, inline validation

### UI/UX Design
`nextlevelbuilder/ui-ux-pro-max-skill@design` (12.6K installs)
- Brand identity and design tokens
- Logo design (55 styles, 30 color palettes)
- UI styling with Tailwind
- SVG icon design
- Banner/social media photo design

### Modern Web Development
`mindrally/skills@modern-web-development` (981 installs)
- TypeScript/React/Next.js best practices (general reference)
- Tailwind CSS utility-first approach
- Accessibility: keyboard nav, ARIA labels, WCAG contrast
- Error handling: early returns, guard clauses

## CI/CD Pipeline (GitHub Actions)
- HTML validation: `html-validate` — validates all `.html` files in dist/ and public/
- JS linting: `eslint` with browser globals
- Type check: `astro check` (TypeScript)
- Contrast check: `node scripts/contrast.mjs` (WCAG + APCA, process.exit(1) on fail)
- Link checking: `lycheeverse/lychee-action` — checks all external links
- Lighthouse CI: performance, accessibility, SEO, best practices audits
- Trigger: push/PR to `main`

## Project Structure
```
├── AGENTS.md                    # This file
├── astro.config.mjs             # Astro 7 + sitemap + Tailwind v4 (vite plugin)
├── src/
│   ├── pages/                   # Rutas (.astro): index, gracias, terminos,
│   │                             # politica-de-privacidad, arrepentimiento
│   ├── layouts/
│   │   └── Layout.astro         # Shell: <head>, navbar, menú móvil, footer,
│   │                             # #toast-container (región viva), sprite de iconos
│   ├── components/
│   │   ├── IconSprite.astro     # Sprite SVG de iconos (#i-*)
│   │   └── CodeBlock.astro      # Bloques de código con copiado
│   ├── styles/
│   │   └── global.css           # @import "tailwindcss" + tokens @theme + utilidades
│   ├── scripts/
│   │   └── main.js              # Scroll, toasts, menú móvil, tema, cotizador, form
│   └── assets/
│       ├── Matecito-logo.svg    # Logo (SVG con bitmap embebido)
│       ├── hero/                # SVGs del hero (sol, campo, gaucho, primer-plano)
│       └── *.webp              # Imágenes optimizadas (Image component)
├── public/                      # Estáticos (fuentes WOFF2, favicons, CNAME, robots.txt)
├── scripts/
│   ├── contrast.mjs            # Verificación WCAG 2.2 + APCA (lee tokens de global.css)
│   └── dev.mjs                 # Script de dev server
├── .github/workflows/          # CI (validate, links, lighthouse) + deploy
├── .htmlvalidate.json          # HTML validation config
├── eslint.config.js            # ESLint flat config
└── package.json                # devDependencies and scripts
```

> Los `.html` sueltos en la raíz (`index.html`, `gracias.html`, etc.) son restos
> pre-Astro: ya no los usa nadie (las rutas se generan desde `src/pages/`).
> Los archivos `js/` y `tailwind.config.js` también se eliminaron por el mismo
> motivo (Tailwind v4 no lee `tailwind.config.js` sin `@config`).

## Common Commands
```bash
bun run test             # Validate HTML + lint JS + astro check
bun run validate:html    # html-validate on dist/ and public/
bun run lint:js          # eslint on src/scripts/*.js
bun run check            # astro check (type checking)
bun run build            # astro build -> dist/
bun run dev              # servidor de desarrollo
```

## Gestor de paquetes
Este proyecto **no usa `npm`**. Usá **`bun`** (recomendado) o **`pnpm`**:
```bash
bun install          # o: pnpm install
bun run test         # o: pnpm run test
```

## 🎨 Identidad visual

Tokens OKLCh definidos en `src/styles/global.css` (`@theme`):

| Rol | Color | Uso |
|-----|-------|-----|
| Verde principal | `#00704A` | CTAs, enlaces, acentos |
| Verde profundo | `#1E3932` | Fondos oscuros, texto |
| Crema | `#FDFBF7` | Fondo principal |
| Blanco | `#FFFFFF` | Texto sobre oscuro |
| Azul | `#2563EB` | Acento (Fundador & Scrum Master) |

Modo oscuro nativo: `prefers-color-scheme` + toggle de 1 botón (sol/luna) con `localStorage`. Script inline en `<head>` para evitar parpadeo.

## ♿ Accesibilidad

- WCAG 2.2 AA verificado con `scripts/contrast.mjs` (WCAG + APCA)
- `prefers-reduced-motion` respetado en todas las animaciones
- Navegación por teclado: skip link, menú móvil con `aria-expanded`/`aria-controls`, cierre con `Esc` y gestión de foco
- Regiones con scroll (`<pre>`) accesibles por teclado (`tabindex="0"`)
- Toasts con `role="status"` / `role="alert"`

## 🔍 Verificar contraste

```bash
node scripts/contrast.mjs
```

El script lee los tokens de `src/styles/global.css` y verifica todos los pares texto/fondo. Hace `process.exit(1)` si algún par falla.

## 🚀 Deploy

GitHub Pages vía `.github/workflows/deploy.yml` (Astro build + `actions/deploy-pages`).

**Paso manual (una vez):** en Settings → Pages → Source → **"GitHub Actions"**.

**Rollback:** revertir la configuración de Pages a la rama anterior y redeployar el commit previo.

## FormSubmit (formulario de contacto)

El formulario usa FormSubmit (POST normal a `formsubmit.co/email`). Para ocultar el email del endpoint:

1. Enviar el formulario una vez (con el email visible).
2. FormSubmit envía un email con el Form ID.
3. Reemplazar `https://formsubmit.co/email@dominio.com` por `https://formsubmit.co/FORM_ID`.
4. Documentación: https://formsubmit.co/documentation

**No aplicar hasta que el alias esté activo.**
