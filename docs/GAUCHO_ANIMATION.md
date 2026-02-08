# 🧉 Gaucho Mate Animado

Animaciones CSS para el SVG del gaucho mate con humo animado y partículas de código flotantes.

## ✨ Características

- ✅ **Fondo transparente** - Removido el fondo naranja original
- 🌊 **Humo animado** - Efecto de humo flotante con ondas
- 💻 **Partículas de código** - Snippets de código que flotan desde el mate
- 🎨 **Personalizable** - Colores y snippets configurables
- 📱 **Responsive** - Se adapta a cualquier tamaño
- ⚡ **Performance optimizado** - Animaciones CSS puras

## 📁 Archivos

```
website/
├── public/
│   └── gaucho-animated.svg          # SVG sin fondo (transparente)
├── css/
│   └── gaucho-animation.css         # Estilos y animaciones
├── js/
│   └── gaucho-animator.js           # Controlador JavaScript
└── examples/
    └── gaucho-demo.html             # Demo completo
```

## 🚀 Uso Rápido

### Opción 1: HTML básico

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <link rel="stylesheet" href="css/gaucho-animation.css">
</head>
<body>
    <div class="gaucho-container">
        <img id="gaucho-svg" src="public/gaucho-animated.svg" alt="Gaucho Mate">
        
        <!-- Partículas de código -->
        <div class="code-particles">
            <div class="code-particle" style="--drift: -1">&lt;div&gt;</div>
            <div class="code-particle" style="--drift: 1">{code}</div>
            <div class="code-particle" style="--drift: -0.5">()=&gt;</div>
            <div class="code-particle" style="--drift: 0.5">const</div>
            <div class="code-particle" style="--drift: -1.2">function</div>
            <div class="code-particle" style="--drift: 1.2">let x;</div>
            <div class="code-particle" style="--drift: -0.7">&lt;/&gt;</div>
            <div class="code-particle" style="--drift: 0.7">async</div>
        </div>
    </div>
</body>
</html>
```

### Opción 2: Con JavaScript (Auto-inicialización)

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <link rel="stylesheet" href="css/gaucho-animation.css">
</head>
<body>
    <div style="position: relative; display: inline-block;">
        <img id="gaucho-svg" src="public/gaucho-animated.svg" 
             data-auto-animate alt="Gaucho Mate">
    </div>
    
    <script src="js/gaucho-animator.js"></script>
</body>
</html>
```

### Opción 3: Con JavaScript (Control manual)

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <link rel="stylesheet" href="css/gaucho-animation.css">
</head>
<body>
    <div style="position: relative; display: inline-block;">
        <img id="gaucho-svg" src="public/gaucho-animated.svg" alt="Gaucho Mate">
    </div>
    
    <script src="js/gaucho-animator.js"></script>
    <script>
        // Inicializar con opciones personalizadas
        const animator = new GauchoAnimator('gaucho-svg', {
            codeSnippets: [
                'function()', 'const x', 'React', 'Vue', 'Angular',
                '&lt;Component /&gt;', 'import', 'export', 'class'
            ],
            particleCount: 10,
            codeColor: '#00ff00'  // Verde brillante
        });
        
        // Métodos disponibles:
        // animator.pause();          // Pausar animaciones
        // animator.resume();         // Reanudar animaciones
        // animator.updateColors('#ff0000');  // Cambiar color
        // animator.destroy();        // Eliminar animaciones
    </script>
</body>
</html>
```

## 🎨 Personalización

### Cambiar colores de las partículas

Puedes modificar los colores usando CSS variables:

```css
:root {
    --code-color: #4CAF50;         /* Color principal */
    --code-glow: rgba(76, 175, 80, 0.5);  /* Brillo */
}
```

O en JavaScript:

```javascript
const animator = new GauchoAnimator('gaucho-svg', {
    codeColor: '#FF5722'  // Naranja
});
```

### Cambiar snippets de código

```javascript
const animator = new GauchoAnimator('gaucho-svg', {
    codeSnippets: [
        'Tu', 'código', 'aquí', '{}', '[]', '()',
        'console.log()', 'return;', 'if()', 'else'
    ],
    particleCount: 12  // Más partículas
});
```

### Modificar velocidad de animación

En `gaucho-animation.css`:

```css
/* Hacer las animaciones más lentas */
.code-particle {
    animation: float-code 6s ease-in-out infinite;  /* Era 4s */
}

@keyframes smoke-rise {
    /* Ajustar timing según necesites */
}
```

## 🎯 Integración en tu sitio

### En index.html

```html
<section id="hero">
    <div class="gaucho-container">
        <img id="gaucho-svg" src="public/gaucho-animated.svg" 
             data-auto-animate alt="Mate Codificador">
    </div>
    <h1>Matecito Tech</h1>
    <p>Código con sabor a mate</p>
</section>

<!-- CSS -->
<link rel="stylesheet" href="css/gaucho-animation.css">

<!-- JavaScript -->
<script src="js/gaucho-animator.js"></script>
```

### Estilo responsivo

```css
.gaucho-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

@media (max-width: 768px) {
    .gaucho-container {
        max-width: 300px;
    }
    
    .code-particle {
        font-size: 10px;  /* Partículas más pequeñas en móvil */
    }
}
```

## 🌟 Demo

Abre `examples/gaucho-demo.html` en tu navegador para ver una demostración completa.

## ⚙️ API JavaScript

### Constructor

```javascript
new GauchoAnimator(elementId, options)
```

**Parámetros:**
- `elementId` (string): ID del elemento SVG o IMG
- `options` (object): Configuración opcional

**Opciones disponibles:**
```javascript
{
    codeSnippets: Array,       // Snippets de código a mostrar
    particleCount: Number,     // Cantidad de partículas (default: 8)
    enableSmoke: Boolean,      // Habilitar animación de humo (default: true)
    enableCodeParticles: Boolean,  // Habilitar partículas (default: true)
    codeColor: String          // Color de las partículas (default: '#4CAF50')
}
```

### Métodos

- `animator.updateColors(color)` - Actualizar color de partículas
- `animator.pause()` - Pausar animaciones
- `animator.resume()` - Reanudar animaciones
- `animator.destroy()` - Eliminar todas las animaciones

## 📝 Notas

- El SVG original fue modificado para remover el fondo naranja (#F69141)
- Las animaciones usan CSS puro para mejor performance
- Compatible con todos los navegadores modernos
- No requiere librerías externas

## 🐛 Troubleshooting

**Las partículas no aparecen:**
- Verifica que el contenedor padre tenga `position: relative`
- Asegúrate de que `gaucho-animation.css` esté cargado

**El SVG no se ve:**
- Verifica la ruta del archivo SVG
- Asegúrate de que el servidor web esté sirviendo archivos SVG correctamente

**Las animaciones van muy rápido/lento:**
- Ajusta los tiempos en `@keyframes` en el archivo CSS
- Modifica `animation-duration` según tus necesidades

## 📄 Licencia

Libre para usar en tu proyecto Matecito Tech 🧉

---

**¡Disfruta tu mate animado! ☕️💻**
