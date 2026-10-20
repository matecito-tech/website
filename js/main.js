document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const form = document.getElementById('contactForm');
    let ticking = false;

    // 1. NAVBAR SCROLL (Optimized)
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('shadow-md', scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // 2. TOAST NOTIFICATIONS
    const showToast = (msg, type = 'success') => {
        const c = document.getElementById('toast-container');
        if (!c) return;

        const t = document.createElement('div');
        t.className = `toast ${type}`;

        const ns = 'http://www.w3.org/2000/svg';
        const icon = document.createElementNS(ns, 'svg');
        icon.setAttribute('class', 'icon');
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
            loading: { html: '<svg class="icon animate-spin" width="1em" height="1em"><use href="#i-refresh"/></svg> Preparando el mate...', disabled: true, classes: ['opacity-75', 'cursor-not-allowed'] },
            success: { html: '<svg class="icon" width="1em" height="1em"><use href="#i-check_circle"/></svg> ¡Todo listo!', disabled: false, classes: ['bg-green-600'], remove: ['bg-brand-orange'] },
            error: { html: '<svg class="icon" width="1em" height="1em"><use href="#i-error"/></svg> Error al enviar', disabled: false, classes: [] },
            reset: { html: text, disabled: false, classes: ['bg-brand-orange'], remove: ['opacity-75', 'cursor-not-allowed', 'bg-green-600'] }
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
                .catch(e => {
                    console.error('Error:', e);
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

    // 7. COTIZADOR DE PRECIOS EN TIEMPO REAL
    const selectServicio = document.getElementById('asunto');
    const displayPrecio = document.getElementById('precio-estimado');
    const containerPrecio = document.getElementById('precio-estimado-container');
    const mensajePrecio = document.getElementById('precio-mensaje');

    let cotizacionDolar = 1450; // Fallback
    let apiFallida = false;

    const serviciosPrecios = {
        landing: 250,
        ecommerce: 550,
        automatizacion: 350,
        mantenimiento: 50
    };

    const fetchDolarBlue = async () => {
        try {
            const res = await fetch('https://dolarapi.com/v1/dolares/blue');
            const data = await res.json();
            cotizacionDolar = data.compra;
        } catch (e) {
            console.warn('Usando cotización fallback:', e);
            apiFallida = true;
        }
    };

    if (selectServicio) {
        fetchDolarBlue();

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

    // 6. MOBILE MENU (accesible: aria-expanded, aria-controls, cierre con Esc, foco)
    const mobileMenuBtn = document.querySelector('[aria-controls="mobile-menu"]');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.setAttribute('aria-hidden', String(expanded));
            mobileMenu.classList.toggle('hidden');
            if (!expanded) {
                const firstLink = mobileMenu.querySelector('a');
                if (firstLink) firstLink.focus();
            }
        });

        mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.focus();
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.focus();
            });
        });
    }

    // 7. GAUCHO ANIMATOR
    setTimeout(() => {
        if (typeof GauchoAnimator !== 'undefined') {
            new GauchoAnimator('gaucho-svg');
        }
    }, 500);
});
