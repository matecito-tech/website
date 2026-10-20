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
├── index.html                   # Main landing page (single-page app)
├── arrepentimiento.html         # Right of withdrawal (B2B legal)
├── politica-de-privacidad.html  # Privacy policy
├── terminos-y-condiciones.html  # Terms and conditions
├── js/
│   ├── main.js                  # Site JS (scroll animations, price calc, form)
│   └── gaucho-animator.js       # Gaucho SVG animation
├── public/
│   ├── Matecito-logo.svg        # Main logo (light)
│   ├── matecito-favicon.svg     # Favicon (217KB, large SVG)
│   ├── gaucho.svg               # Gaucho illustration (large SVG)
│   └── Matecito-brand-og.jpg    # Open Graph image
├── .github/workflows/ci.yml     # CI pipeline
├── .htmlvalidate.json            # HTML validation config
├── eslint.config.js              # ESLint flat config
└── package.json                 # devDependencies and scripts
```

## Common Commands
```bash
npm run test             # Validate HTML + lint JS
npm run validate:html    # html-validate on all HTML files
npm run lint:js          # eslint on js/*.js
npm run serve            # python3 -m http.server 8080
```
