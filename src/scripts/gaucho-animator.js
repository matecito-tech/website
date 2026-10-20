/**
 * Gaucho Mate Animator v2.0
 * Animación sutil 3D Tilt y gestión de humo optimizada
 */

class GauchoAnimator {
    constructor(svgElementId, options = {}) {
        this.svgElement = document.getElementById(svgElementId);
        this.container = this.svgElement?.closest('.gaucho-hero-container') || this.svgElement?.parentElement;

        if (!this.svgElement || !this.container) {
            console.warn('GauchoAnimator: Elemento SVG o contenedor no encontrado');
            return;
        }

        this.options = {
            maxTilt: 15, // Grados máximos de inclinación
            perspective: 1000,
            scale: 1.05,
            ...options
        };

        this.init();
    }

    init() {
        // Asegurar perspectiva en el contenedor y transición suave
        this.container.style.transformStyle = 'preserve-3d';
        this.container.style.transition = 'transform 0.1s ease-out';

        // Tracking del mouse en el documento o sección hero para mayor área de efecto
        const heroSection = this.container.closest('section') || document.body;

        // Usar requestAnimationFrame para performance (60fps)
        let ticking = false;

        heroSection.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleMouseMove(e);
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Reset al salir
        heroSection.addEventListener('mouseleave', () => {
            this.container.style.transition = 'transform 0.5s ease-out';
            this.container.style.transform = `perspective(${this.options.perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    }

    handleMouseMove(e) {
        // Calcular porcentajes (-1 a 1)
        const xPct = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        const yPct = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

        // Calcular rotación del contenedor (Tilt)
        const rotateY = xPct * this.options.maxTilt;
        const rotateX = -yPct * this.options.maxTilt;

        // Aplicar transformación al contenedor
        this.container.style.transform = `
            perspective(${this.options.perspective}px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg) 
            scale(${this.options.scale})
        `;
    }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.GauchoAnimator = GauchoAnimator;
}
