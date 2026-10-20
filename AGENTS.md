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
- Talwind CSS utility-first approach
- Accessibility: keyboard nav, ARIA labels, WCAG contrast
- Error handling: early returns, guard clauses

## CI/CD Pipeline (GitHub Actions)
- HTML validation: `html-validate` — validates all `.html` files
- JS linting: `eslint` with browser globals
- Link checking: `lycheeverse/lychee-action` — checks all external links
- Lighthouse CI: performance, accessibility, SEO, best practices audits
- Trigger: push/PR to `main`

## Project Structure
```
├── AGENTS.md                    # This file
├── astro.config.mjs             # Astro 7 + sitemap + Tailwind v4 (vite plugin)
├── src/
│   ├── pages/                   # Rutas (Astro): index, gracias, terminos,
│   │                             # politica-de-privacidad, arrepentimiento
│   ├── layouts/
│   │   └── Layout.astro         # Shell: <head>, navbar, menú móvil, footer,
│   │                             # #toast-container (región viva), sprite de iconos
│   ├── components/
│   │   ├── IconSprite.astro     # Sprite SVG de iconos (#i-*)
│   │   └── CodeBlock.astro      # Bloques de código con copiado
│   ├── styles/
│   │   ├── global.css           # @import "tailwindcss" + tokens @theme + utilidades
│   │   └── gaucho-animation.css # Animación idle del gaucho
│   └── scripts/
│       ├── main.js              # Scroll, toasts, menú móvil, tema, cotizador, form
│       └── gaucho-animator.js   # Tilt 3D del gaucho (custom properties CSS)
├── public/                      # Se sirve tal cual: favicons, fuentes, logos,
│                                 # gaucho.svg, llms.txt, robots.txt, CNAME
├── scripts/                     # Utilidades de dev (scripts/dev.mjs)
├── .github/workflows/ci.yml     # CI pipeline
├── .htmlvalidate.json            # HTML validation config
├── eslint.config.js              # ESLint flat config
└── package.json                 # devDependencies and scripts
```

> Los `.html` sueltos en la raíz (`index.html`, `gracias.html`, etc.) son restos
> pre-Astro: ya no los usa nadie (las rutas se generan desde `src/pages/`).
> Los archivos `js/` y `tailwind.config.js` también se eliminaron por el mismo
> motivo (Tailwind v4 no lee `tailwind.config.js` sin `@config`).

## Common Commands
```bash
bun run test             # Validate HTML + lint JS (src/scripts/*.js)
bun run validate:html    # html-validate on all HTML files
bun run lint:js          # eslint on src/scripts/*.js
bun run build            # astro build -> dist/
bun run dev              # servidor de desarrollo
```
