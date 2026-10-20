/**
 * Gaucho Mate Animator v4.0
 *
 * Tilt 3D + Parallax por capas.
 * El SVG se inyecta inline en el HTML, por lo que las capas (#layer-back,
 * #layer-desk, #layer-char) son accesibles desde JS y reciben transformaciones
 * individuales según su data-depth.
 */
class GauchoAnimator {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.warn('GauchoAnimator: Contenedor no encontrado');
            return;
        }

        this.svg = this.container.querySelector('svg') || this.container;
        this.layers = this.container.querySelectorAll('.gaucho-layer');

        this.options = {
            maxTilt: 15,
            perspective: 1000,
            scale: 1.03,
            parallaxStrength: 35,
            ...options
        };

        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.ticking = false;
        this.scaled = false;
        this.bound = false;

        this.init();
    }

    init() {
        this.container.style.setProperty('--perspective', `${this.options.perspective}px`);
        this.container.style.setProperty('--scale', '1');
        this.container.style.setProperty('--rx', '0deg');
        this.container.style.setProperty('--ry', '0deg');

        this.onMouseMove = e => {
            if (this.ticking) return;
            this.ticking = true;
            window.requestAnimationFrame(() => {
                this.handleMouseMove(e);
                this.ticking = false;
            });
        };

        this.onMouseLeave = () => {
            this.container.style.setProperty('--rx', '0deg');
            this.container.style.setProperty('--ry', '0deg');
            if (this.scaled) {
                this.scaled = false;
                this.container.style.setProperty('--scale', '1');
            }
            // Reset parallax layers (restaurar translateZ base)
            this.layers.forEach(layer => {
                const depth = parseFloat(layer.dataset.depth) || 0.5;
                const baseZ = depth < 0.3 ? -50 : (depth > 0.7 ? 50 : 0);
                layer.style.transform = `translate3d(0, 0, ${baseZ}px)`;
            });
        };

        this.onMotionChange = () => {
            if (this.reducedMotion.matches) this.unbind();
            else this.bind();
        };

        this.reducedMotion.addEventListener('change', this.onMotionChange);
        this.bind();
    }

    bind() {
        if (this.bound || this.reducedMotion.matches) return;
        this.bound = true;
        this.container.addEventListener('mousemove', this.onMouseMove);
        this.container.addEventListener('mouseleave', this.onMouseLeave);
    }

    unbind() {
        if (!this.bound) return;
        this.bound = false;
        this.container.removeEventListener('mousemove', this.onMouseMove);
        this.container.removeEventListener('mouseleave', this.onMouseLeave);
        this.onMouseLeave();
    }

    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        const w = rect.width || 1;
        const h = rect.height || 1;
        const x = (e.clientX - (rect.left + w / 2)) / (w / 2);
        const y = (e.clientY - (rect.top + h / 2)) / (h / 2);

        this.container.style.setProperty('--rx', `${-y * this.options.maxTilt}deg`);
        this.container.style.setProperty('--ry', `${x * this.options.maxTilt}deg`);

        if (!this.scaled) {
            this.scaled = true;
            this.container.style.setProperty('--scale', String(this.options.scale));
        }

        // Parallax por capas: cada capa se mueve según su data-depth
        // Preservamos el translateZ base (definido en CSS) y sumamos el parallax
        this.layers.forEach(layer => {
            const depth = parseFloat(layer.dataset.depth) || 0.5;
            const baseZ = depth < 0.3 ? -50 : (depth > 0.7 ? 50 : 0);
            const px = x * this.options.parallaxStrength * depth;
            const py = y * this.options.parallaxStrength * depth;
            layer.style.transform = `translate3d(${px}px, ${py}px, ${baseZ}px)`;
        });
    }
}

if (typeof window !== 'undefined') {
    window.GauchoAnimator = GauchoAnimator;
}
