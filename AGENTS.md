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

## Reglas del proyecto

- Gestor de paquetes: **bun** (nunca npm/pnpm). `bun run test` + `bun run test:e2e` antes de cerrar un cambio.
- Datos del negocio (precios, WhatsApp, email, CUIT): solo en `src/data/site.ts`.
- Textos legales: `src/content/legal/*.md`. Mantener la leyenda obligatoria de la AAIP (Ley 25.326) y los links a arrepentimiento/baja visibles desde la primera pantalla (Res. 424/2020).
- CSP activa (`security.csp` en `astro.config.mjs`): no usar `style="..."` en markup ni scripts inline sin pasar por Astro; dominios externos nuevos van en `directives`.
- El gaucho (`src/assets/hero/gaucho.svg`) tiene animaciones CSS internas: no usar `<` dentro de comentarios del `<style>` (rompe el XML).
- Nada debe quedar por encima del gaucho en el hero: los detalles tech viven en `.hero__orbit`/`.hero__drone` con z-index 1.

Ver `README.md` para estructura, comandos y CI/CD.
- Logo: el mate va solo (`Logo.astro`), nunca dentro de una placa o fondo de color. Verde yerba sobre fondos claros, crema/blanco sobre oscuros. El favicon SVG se adapta al tema del sistema.
- Formularios: Worker en `api/` (Gmail SMTP + Turnstile). Si cambia, se despliega a mano con `cd api && bunx cf deploy`: el pipeline de GitHub solo publica el sitio.
- Cloudflare se administra con la CLI `cf` (ver README, sección Cloudflare). No cambiar SSL a "Full (strict)": rompe el sitio (error 526).
