# Matecito Website v3.2 - Edición Completa

Sitio web corporativo de **Matecito**, diseñado con estética "Warm Tech" y estructura de contenido expandida.

## 🌟 Características Nuevas

- **Secciones Completas:** Inicio, Nosotros (Misión/Visión), Servicios (Detallados), Metodología (SCRUM), Equipo y Contacto.
- **Narrativa "Fogón":** Integración visual del código (Python) con valores humanos.
- **Transparencia:** Links a documentación y repositorios.
- **Formulario Inteligente:** Selección de servicios y envío a WhatsApp.

## 🛠️ Tecnologías

- **HTML5 Semántico**
- **Tailwind CSS** (Estilos y Animaciones)
- **JavaScript** (Lógica de negocio y UI)

## 📁 Archivos Clave

- `index.html`: Estructura principal.
- `js/main.js`: Lógica del formulario y efectos.
- `public/`: Assets (Imágenes 3D, logos).

## 🚀 Ejecución

Abrir `index.html` en el navegador o usar un servidor local:
```bash
python -m http.server 8000
```

### Gestor de paquetes

Este proyecto **no usa `npm`**. Usá **`bun`** (recomendado) o **`pnpm`** para instalar dependencias y correr scripts:

```bash
# Instalar dependencias
bun install          # recomendado
# o
pnpm install

# Correr tests (validar HTML + lint JS)
bun run test
# o
pnpm run test

# Solo validar HTML
bun run validate:html

# Solo lint JS
bun run lint:js

# Servidor local
bun run serve        # o python3 -m http.server 8080
```

Nunca uses `npm install` ni `npm run`: el `package-lock.json` y los scripts están pensados para `bun` / `pnpm`.