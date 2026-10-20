document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const form = document.getElementById('contactForm');
    let ticking = false;

    // 1. NAVBAR SCROLL (Optimized)
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar?.classList.toggle('shadow-md', scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // 2. TOAST NOTIFICATIONS (accesible: role="status" + aria-live)
    const showToast = (msg, type = 'success') => {
        const c = document.getElementById('toast-container');
        if (!c) return;

        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.setAttribute('role', type === 'error' ? 'alert' : 'status');
        t.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        const ns = 'http://www.w3.org/2000/svg';
        const icon = document.createElementNS(ns, 'svg');
        icon.setAttribute('class', 'icon');
        icon.setAttribute('aria-hidden', 'true');
        icon.setAttribute('focusable', 'false');
        icon.setAttribute('width', '1em');
        icon.setAttribute('height', '1em');
        const use = document.createElementNS(ns, 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#i-${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}`);
        icon.appendChild(use);

        const text = document.createElement('span');
        text.className = 'font-medium';
        text.textContent = msg;

        t.append(icon, text);
        c.appendChild(t);

        setTimeout(() => t.classList.add('show'), 100);
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => t.remove(), 400);
        }, 4000);
    };

    // 3. BUTTON STATE MANAGER
    const setBtnState = (btn, state, text) => {
        const states = {
            loading: { html: '<svg class="icon animate-spin" aria-hidden="true" focusable="false" width="1em" height="1em"><use href="#i-refresh"/></svg> Preparando el mate...', disabled: true, classes: ['opacity-75', 'cursor-not-allowed'] },
            success: { html: '<svg class="icon" aria-hidden="true" focusable="false" width="1em" height="1em"><use href="#i-check_circle"/></svg> ¡Todo listo!', disabled: false, classes: ['bg-green-600'], remove: ['bg-brand-verde'] },
            error: { html: '<svg class="icon" aria-hidden="true" focusable="false" width="1em" height="1em"><use href="#i-error"/></svg> Error al enviar', disabled: false, classes: [] },
            reset: { html: text, disabled: false, classes: ['bg-brand-verde'], remove: ['opacity-75', 'cursor-not-allowed', 'bg-green-600'] }
        };

        const s = states[state];
        btn.innerHTML = s.html;
        btn.disabled = s.disabled;
        if (s.remove) btn.classList.remove(...s.remove);
        if (s.classes.length) btn.classList.add(...s.classes);
    };

    // 4. FORM HANDLER
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            const data = {
                nombre: document.getElementById('nombre').value,
                contacto: document.getElementById('contacto_dato').value,
                servicio: document.getElementById('asunto')?.value || 'Consulta General',
                mensaje: document.getElementById('mensaje').value
            };

            // Validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$|^\+?[0-9\s-]{8,20}$/.test(data.contacto)) {
                showToast('⚠️ Por favor ingresá un correo o teléfono válido.', 'error');
                return;
            }

            setBtnState(btn, 'loading');

            fetch("https://formsubmit.co/ajax/matecito.tech@gmail.com", {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    _subject: `Nuevo mensaje de ${data.nombre} - Web Matecito`,
                    _template: "table",
                    _captcha: "false"
                })
            })
                .then(r => r.json())
                .then(d => {
                    if (d.success === "false") throw new Error("FormSubmit Error");
                    showToast('¡Formulario enviado! Nos pondremos en contacto pronto.', 'success');
                    setBtnState(btn, 'success');
                    setTimeout(() => {
                        setBtnState(btn, 'reset', orig);
                        form.reset();
                    }, 4000);
                })
                .catch(err => {
                    console.error('Error:', err);
                    showToast('Hubo un problema al enviar. Probá de nuevo más tarde.', 'error');
                    setBtnState(btn, 'error');
                    setTimeout(() => setBtnState(btn, 'reset', orig), 3000);
                });
        });
    }

    // 5. EMBER GENERATION
    const createEmbers = () => {
        const c = document.getElementById('embers-container');
        if (!c) return;

        const f = document.createDocumentFragment();
        for (let i = 0; i < 25; i++) {
            const e = document.createElement('div');
            e.className = 'ember animate-ember';
            e.setAttribute('aria-hidden', 'true');
            const sz = Math.random() * 4 + 2;
            Object.assign(e.style, {
                width: sz + 'px',
                height: sz + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDuration: (Math.random() * 3 + 4) + 's',
                animationDelay: Math.random() * 5 + 's',
                opacity: Math.random() * 0.5 + 0.2
            });
            f.appendChild(e);
        }
        c.appendChild(f);
    };
    createEmbers();

    // 6. MOBILE MENU (accesible: aria-expanded, aria-controls, cierre con Esc, foco)
    const mobileMenuBtn = document.querySelector('[aria-controls="mobile-menu"]');
    const mobileMenu = document.getElementById('mobile-menu');

    const closeMenu = () => {
        if (!mobileMenuBtn || !mobileMenu) return;
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.add('hidden');
    };

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                closeMenu();
            } else {
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenu.classList.remove('hidden');
                const firstLink = mobileMenu.querySelector('a');
                if (firstLink) firstLink.focus();
            }
        });

        mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
                mobileMenuBtn.focus();
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Cerrar al pasar a desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) closeMenu();
        });
    }

    // 7. THEME TOGGLE (3 estados: auto / claro / oscuro)
    const THEME_KEY = 'theme';
    const themeButtons = document.querySelectorAll('[data-theme-toggle]');

    const applyTheme = (theme) => {
        const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.dataset.theme = theme;
        themeButtons.forEach(btn => {
            btn.setAttribute('aria-pressed', String(btn.dataset.themeToggle === theme));
        });
    };

    const stored = localStorage.getItem(THEME_KEY) || 'auto';
    applyTheme(stored);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const next = btn.dataset.themeToggle;
            localStorage.setItem(THEME_KEY, next);
            applyTheme(next);
        });
    });

    // Reaccionar a cambios del SO cuando está en 'auto'
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if ((localStorage.getItem(THEME_KEY) || 'auto') === 'auto') applyTheme('auto');
    });

    // 8. COTIZADOR DE PRECIOS (dólar bajo demanda: solo al interactuar)
    const selectServicio = document.getElementById('asunto');
    const displayPrecio = document.getElementById('precio-estimado');
    const containerPrecio = document.getElementById('precio-estimado-container');
    const mensajePrecio = document.getElementById('precio-mensaje');

    let cotizacionDolar = 1450; // Fallback
    let apiFallida = false;
    let dolarCargado = false;

    const serviciosPrecios = {
        landing: 250,
        ecommerce: 550,
        automatizacion: 350,
        mantenimiento: 50
    };

    const fetchDolarBlue = async () => {
        if (dolarCargado) return;
        try {
            const res = await fetch('https://dolarapi.com/v1/dolares/blue');
            const data = await res.json();
            cotizacionDolar = data.compra;
            dolarCargado = true;
        } catch (e) {
            console.warn('Usando cotización fallback:', e);
            apiFallida = true;
            dolarCargado = true;
        }
    };

    if (selectServicio) {
        selectServicio.addEventListener('focus', fetchDolarBlue, { once: true });
        selectServicio.addEventListener('click', fetchDolarBlue, { once: true });

        selectServicio.addEventListener('change', () => {
            const svc = selectServicio.value;
            const precioUSD = serviciosPrecios[svc];

            if (precioUSD) {
                const totalARS = precioUSD * cotizacionDolar;
                const formatted = new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 2
                }).format(totalARS);

                displayPrecio.textContent = formatted;
                mensajePrecio.textContent = apiFallida ? '⚠️ Precio sujeto a cambios (Cotización base)' : `Cotización Blue: $${cotizacionDolar}`;
                if (svc === 'mantenimiento') mensajePrecio.textContent += ' (Costo mensual)';

                containerPrecio.classList.remove('hidden');
            } else {
                containerPrecio.classList.add('hidden');
            }
        });
    }

    // 9. GAUCHO ANIMATOR
    setTimeout(() => {
        if (typeof GauchoAnimator !== 'undefined') {
            new GauchoAnimator('gaucho-svg');
        }
    }, 500);
});
