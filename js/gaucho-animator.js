/**
 * Gaucho Mate Animator
 * Agrega animaciones de humo y partículas de código al SVG del gaucho mate
 */

class GauchoAnimator {
    constructor(svgElementId, options = {}) {
        this.svgElement = document.getElementById(svgElementId);
        this.options = {
            codeSnippets: [
                '&lt;div&gt;', '{code}', '()=&gt;', 'const',
                'function', 'let x;', '&lt;/&gt;', 'async',
                'return', 'import', 'export', 'class'
            ],
            particleCount: 8,
            enableSmoke: true,
            enableCodeParticles: true,
            codeColor: '#4CAF50',
            ...options
        };

        this.init();
    }

    init() {
        if (!this.svgElement) {
            console.error('SVG element not found');
            return;
        }

        // Crear contenedor de partículas si está habilitado
        if (this.options.enableCodeParticles) {
            this.createCodeParticles();
        }

        // Agregar clases de animación al SVG
        if (this.options.enableSmoke) {
            this.addSmokeAnimation();
        }
    }

    createCodeParticles() {
        // Verificar si ya existe el contenedor
        let container = this.svgElement.parentElement.querySelector('.code-particles');

        if (!container) {
            // Asegurarse de que el elemento padre tenga position relative
            this.svgElement.parentElement.style.position = 'relative';

            // Crear contenedor de partículas
            container = document.createElement('div');
            container.className = 'code-particles';
            this.svgElement.parentElement.appendChild(container);
        } else {
            // Limpiar partículas existentes
            container.innerHTML = '';
        }

        // Crear partículas individuales
        for (let i = 0; i < this.options.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'code-particle';

            // Seleccionar snippet aleatorio
            const snippetIndex = Math.floor(Math.random() * this.options.codeSnippets.length);
            particle.innerHTML = this.options.codeSnippets[snippetIndex];

            // Configurar posición y drift aleatorio
            const drift = (Math.random() - 0.5) * 2; // -1 a 1
            particle.style.setProperty('--drift', drift);
            particle.style.color = this.options.codeColor;

            container.appendChild(particle);
        }
    }

    addSmokeAnimation() {
        // Aquí puedes agregar clases específicas a elementos del SVG
        // que representen el humo o elementos que quieras animar
        const svgId = this.svgElement.id;
        this.svgElement.querySelectorAll('path, circle, ellipse').forEach((element, index) => {
            // Agregar clases de animación a elementos específicos
            // (necesitarías identificar los elementos correctos del SVG)
        });
    }

    updateColors(newColor) {
        this.options.codeColor = newColor;
        const particles = this.svgElement.parentElement.querySelectorAll('.code-particle');
        particles.forEach(particle => {
            particle.style.color = newColor;
        });
    }

    pause() {
        const container = this.svgElement.parentElement.querySelector('.code-particles');
        if (container) {
            container.style.animationPlayState = 'paused';
        }
    }

    resume() {
        const container = this.svgElement.parentElement.querySelector('.code-particles');
        if (container) {
            container.style.animationPlayState = 'running';
        }
    }

    destroy() {
        const container = this.svgElement.parentElement.querySelector('.code-particles');
        if (container) {
            container.remove();
        }
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GauchoAnimator;
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.GauchoAnimator = GauchoAnimator;
}

// Auto-inicializar si se encuentra el elemento con ID específico
document.addEventListener('DOMContentLoaded', function () {
    const gauchoSvg = document.getElementById('gaucho-svg');
    if (gauchoSvg && gauchoSvg.hasAttribute('data-auto-animate')) {
        new GauchoAnimator('gaucho-svg');
    }
});
