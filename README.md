# Matecito Website v4.0 — Astro

Sitio web corporativo de **Matecito**, rediseñado con estética "Warm Tech" y una identidad visual verde (paleta OKLCH) con modo oscuro nativo.

## 🛠️ Tecnologías

- **Astro 7.4.1** — generación estática, cero JS por defecto
- **Tailwind CSS v4** vía `@tailwindcss/vite` (tokens en `@theme`)
- **JavaScript vanilla** en `<script>` de componentes `.astro` (sin framework de UI)
- **Fuentes autoalojadas** (Manrope, Space Grotesk, JetBrains Mono) — sin Google Fonts

## 📁 Estructura

```
├── astro.config.mjs          # site, base, vite (Tailwind)
├── src/
│   ├── pages/                # Rutas (.astro): index, gracias, legales
│   ├── layouts/Layout.astro  # HTML base, head, navbar, footer, tema
│   ├── components/           # CodeBlock, IconSprite (32 iconos SVG)
│   ├── styles/global.css     # @theme (tokens OKLCH), @source, modo oscuro
│   ├── scripts/main.js       # Formulario, menú móvil, toasts, tema, cotizador
│   ├── scripts/gaucho-animator.js
│   └── assets/fonts/         # Fuentes .ttf
├── public/                   # Estáticos (imágenes, fuentes, favicons, CNAME)
├── scripts/contrast.mjs      # Verificación WCAG 2.2 + APCA
└── .github/workflows/        # CI (validate, links, lighthouse) + deploy
```

## 🚀 Comandos

Usá **bun** (o `pnpm`). Nunca `npm`.

```bash
bun install          # instalar dependencias
bun run dev          # dev server en http://localhost:4321
bun run build        # build estático -> dist/
bun run preview      # previsualizar dist/
bun run test         # html-validate + eslint
bun run build:css    # recompilar CSS suelto (postcss)
```

### Gestor de paquetes

Este proyecto **no usa `npm`**. Usá **`bun`** (recomendado) o **`pnpm`**:

```bash
bun install          # o: pnpm install
bun run test         # o: pnpm run test
```

## 🎨 Identidad visual

Tokens OKLCH definidos en `src/styles/global.css` (`@theme`):

| Rol | Color | Uso |
|-----|-------|-----|
| Verde principal | `#00704A` | CTAs, enlaces, acentos |
| Verde profundo | `#1E3932` | Fondos oscuros, texto |
| Crema | `#FDFBF7` | Fondo principal |
| Dorado | `#CBA258` | Acentos decorativos |
| Blanco | `#FFFFFF` | Texto sobre oscuro |

Modo oscuro nativo: `prefers-color-scheme` + toggle de 3 estados (auto/claro/oscuro) con `localStorage`. Script inline en `<head>` para evitar parpadeo.

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

## 🚀 Deploy

GitHub Pages vía `.github/workflows/deploy.yml` (Astro build + `actions/deploy-pages`).

**Paso manual (una vez):** en Settings → Pages → Source → **"GitHub Actions"**.

**Rollback:** revertir la configuración de Pages a la rama anterior y redeployar el commit previo.
