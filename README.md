# Matecito Website v4.0 — Astro

Sitio web corporativo de **Matecito**, rediseñado con estética "Warm Tech" y una identidad visual verde (paleta OKLCH) con modo oscuro nativo.

## 🛠️ Tecnologías

- **Astro 7.4.1** — generación estática, cero JS por defecto
- **Tailwind CSS v4** vía `@tailwindcss/vite` (tokens en `@theme`)
- **JavaScript vanilla** en `<script>` de componentes `.astro` (sin framework de UI)
- **Fuentes autoalojadas** (Manrope, Space Grotesk, JetBrains Mono) en WOFF2 subseteado

## 📁 Estructura

```
├── astro.config.mjs          # site, base, trailingSlash, vite (Tailwind)
├── src/
│   ├── pages/                # Rutas (.astro): index, gracias, legales
│   ├── layouts/Layout.astro  # HTML base, head, navbar, footer, tema
│   ├── components/           # CodeBlock, IconSprite (32 iconos SVG)
│   ├── styles/global.css     # @theme (tokens OKLCh), modo oscuro
│   ├── scripts/main.js       # Formulario, menú móvil, toasts, tema, cotizador
│   └── assets/               # Imágenes optimizadas (Image component)
│       └── hero/             # SVGs del hero (sol, campo, gaucho, primer-plano)
├── public/                   # Estáticos (fuentes WOFF2, favicons, CNAME, robots.txt)
├── scripts/
│   ├── contrast.mjs          # Verificación WCAG 2.2 + APCA (lee tokens de global.css)
│   └── dev.mjs               # Script de dev server
├── .github/workflows/        # CI (validate, links, lighthouse) + deploy
└── .htmlvalidate.json        # Config de validación HTML
```

## 🚀 Comandos

Usá **bun** (o `pnpm`). Nunca `npm`.

```bash
bun install          # instalar dependencias
bun run dev          # dev server en http://localhost:4321
bun run build        # build estático -> dist/
bun run preview      # previsualizar dist/
bun run test         # html-validate (dist) + eslint + astro check
bun run check        # astro check (type checking)
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
