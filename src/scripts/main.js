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

    // 2. TOAST NOTIFICATIONS
    // La región viva es #toast-container (role="status" aria-live="polite" en Layout.astro).
    // Los toasts son hijos de esa región; sólo el de error suma role="alert" (agresivo).
    const TOAST_TIMEOUT = 4000;
    const TOAST_ICONS = { success: 'check_circle', error: 'error', info: 'info' };

    const svgEl = (tag, attrs = {}) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    };

    const showToast = (msg, type = 'success') => {
        const c = document.getElementById('toast-container');
        if (!c) return;

        const t = document.createElement('div');
        t.className = `toast ${type}`;
        // Sólo el error interrumpe (assertive). El resto lo anuncia la región viva.
        if (type === 'error') t.setAttribute('role', 'alert');

        const icon = svgEl('svg', { class: 'icon', 'aria-hidden': 'true', focusable: 'false', width: '1em', height: '1em' });
        icon.appendChild(svgEl('use', { href: `#i-${TOAST_ICONS[type] || 'info'}` }));

        const text = document.createElement('span');
        text.className = 'font-medium';

        // Botón de cierre (WCAG 2.2.1: el aviso se tiene que poder descartar)
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'ml-auto shrink-0 rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
        close.setAttribute('aria-label', 'Cerrar aviso');
        const closeIcon = svgEl('svg', { class: 'icon', 'aria-hidden': 'true', focusable: 'false', width: '1em', height: '1em', viewBox: '0 0 24 24' });
        closeIcon.appendChild(svgEl('path', {
            d: 'M6 6l12 12M18 6L6 18',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round'
        }));
        close.appendChild(closeIcon);

        let timer = null;
        const dismiss = () => {
            clearTimeout(timer);
            timer = null;
            t.classList.remove('show');
            setTimeout(() => t.remove(), 400);
        };
        close.addEventListener('click', dismiss);

        t.append(icon, text, close);
        c.appendChild(t);
        // El texto se setea DESPUÉS de insertar el nodo: si el toast nace con contenido,
        // muchos lectores de pantalla no anuncian el cambio de la región viva.
        text.textContent = msg;

        setTimeout(() => t.classList.add('show'), 100);
        timer = setTimeout(dismiss, TOAST_TIMEOUT);
    };

    // 3. BUTTON STATE MANAGER
const setBtnState = (btn, state, text) => {
        const states = {
            loading: {
                html: '<svg class="icon animate-spin" aria-hidden="true" focusable="false" width="1em" height="1em"><use href="#i-refresh"/></svg> Preparando el mate...',
                disabled: true,
                classes: ['opacity-75', 'cursor-not-allowed'],
                remove: ['bg-green-600']
            },
            success: {
                html: '<svg class="icon" aria-hidden="true" focusable="false" width="1em" height="1em"><use href="#i-check_circle"/></svg> ¡Todo listo!',
                disabled: false,
                classes: ['bg-green-600'],
                remove: ['bg-brand-verde', 'opacity-75', 'cursor-not-allowed']
            },
            error: {
                html: '<svg class="icon" aria-hidden="true" focusable="false" width="1em" height="1em"><use href="#i-error"/></svg> Error al enviar',
                disabled: false,
                classes: [],
                // Sin esto el botón queda con la pinta de "loading" (opacity-75 / cursor-not-allowed)
                remove: ['opacity-75', 'cursor-not-allowed', 'bg-green-600']
            },
            reset: {
                html: text,
                disabled: false,
                classes: ['bg-brand-verde'],
                remove: ['opacity-75', 'cursor-not-allowed', 'bg-green-600']
            }
        };

        const s = states[state];
        if (!s || !btn) return;
        btn.innerHTML = s.html;
        btn.disabled = s.disabled;
        if (s.remove) btn.classList.remove(...s.remove);
        if (s.classes.length) btn.classList.add(...s.classes);
    };

    // 4. FORM HANDLER
    const formStatus = document.getElementById('form-status');
    const setFormStatus = (msg) => {
        if (formStatus) formStatus.textContent = msg;
    };
    // Un solo timer de reset: si se reenvía rápido, el timer viejo no pisa el estado nuevo
    let resetTimer = null;
    const clearResetTimer = () => {
        clearTimeout(resetTimer);
        resetTimer = null;
    };

    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            if (!btn) return;
            const orig = btn.innerHTML;

            const data = {
                nombre: document.getElementById('nombre')?.value?.trim() ?? '',
                contacto: document.getElementById('contacto_dato')?.value?.trim() ?? '',
                servicio: document.getElementById('asunto')?.value || 'Consulta General',
                mensaje: document.getElementById('mensaje')?.value?.trim() ?? ''
            };

            // Validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$|^\+?[0-9\s-]{8,20}$/.test(data.contacto)) {
                showToast('⚠️ Por favor ingresá un correo o teléfono válido.', 'error');
                return;
            }
            if (!data.nombre || !data.mensaje) {
                showToast('⚠️ Completá tu nombre y el mensaje.', 'error');
                return;
            }

            clearResetTimer();
            setBtnState(btn, 'loading');
            setFormStatus('');

            try {
                const res = await fetch('https://formsubmit.co/ajax/matecito.tech@gmail.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        _subject: `Nuevo mensaje de ${data.nombre} - Web Matecito`,
                        _template: 'table',
                        _captcha: 'true'
                    }),
                    signal: AbortSignal.timeout(15000)
                });

                if (!res.ok) throw new Error(`FormSubmit HTTP ${res.status}`);

                const d = await res.json().catch(() => ({}));
                // La API puede devolver booleano o string
                if (d?.success === false || d?.success === 'false') throw new Error('FormSubmit Error');

                showToast('¡Formulario enviado! Nos pondremos en contacto pronto.', 'success');
                setFormStatus('¡Formulario enviado! Nos pondremos en contacto pronto.');
                setBtnState(btn, 'success');
                resetTimer = setTimeout(() => {
                    resetTimer = null;
                    setBtnState(btn, 'reset', orig);
                    form.reset();
                    // El precio estimado era del servicio anterior: no queda congelado
                    document.getElementById('precio-estimado-container')?.classList.add('hidden');
                }, 4000);
            } catch (err) {
                console.error('Error:', err);
                showToast('Hubo un problema al enviar. Probá de nuevo más tarde.', 'error');
                setFormStatus('Hubo un problema al enviar. Probá de nuevo más tarde.');
                setBtnState(btn, 'error');
                resetTimer = setTimeout(() => {
                    resetTimer = null;
                    setBtnState(btn, 'reset', orig);
                }, 3000);
            }
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

    // 6. MOBILE MENU (accesible: aria-expanded, aria-controls, Esc global, foco atrapado)
    const mobileMenuBtn = document.querySelector('[aria-controls="mobile-menu"]');
    const mobileMenu = document.getElementById('mobile-menu');

    const isMenuOpen = () => mobileMenuBtn?.getAttribute('aria-expanded') === 'true';

    const closeMenu = (restoreFocus = false) => {
        if (!mobileMenuBtn || !mobileMenu) return;
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.add('hidden');
        if (restoreFocus) mobileMenuBtn.focus();
    };

    const openMenu = () => {
        if (!mobileMenuBtn || !mobileMenu) return;
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.remove('hidden');
        const firstLink = mobileMenu.querySelector('a');
        if (firstLink) firstLink.focus();
    };

    const getFocusable = () => {
        if (!mobileMenu) return [];
        return Array.from(mobileMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter(el => el.getClientRects().length > 0);
    };

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if (isMenuOpen()) {
                closeMenu(false);
            } else {
                openMenu();
            }
        });

        // Esc global: funciona aunque el foco ya haya salido del menú
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && isMenuOpen()) {
                e.preventDefault();
                closeMenu(true);
            }
        });

        // Trampa de foco: Tab cicla dentro del menú (no escapa al contenido)
        mobileMenu.addEventListener('keydown', e => {
            if (e.key !== 'Tab') return;
            const focusables = getFocusable();
            if (!focusables.length) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            const inside = mobileMenu.contains(active);

            if (e.shiftKey && (active === first || !inside)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (active === last || !inside)) {
                e.preventDefault();
                first.focus();
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => closeMenu(false));
        });

        // Cerrar al hacer click fuera del menú y del botón
        document.addEventListener('click', e => {
            if (!isMenuOpen()) return;
            const target = e.target;
            if (target instanceof Node && (mobileMenu.contains(target) || mobileMenuBtn.contains(target))) return;
            closeMenu(false);
        });

        // Cerrar al pasar a desktop (matchMedia en vez de resize: un solo listener, semántico)
        const desktopQuery = window.matchMedia('(min-width: 1024px)');
        desktopQuery.addEventListener('change', e => {
            if (e.matches) closeMenu(false);
        });
    }

    // 7. THEME TOGGLE (claro / oscuro, respeta preferencia del sistema por defecto)
    const THEME_KEY = 'theme';
    const toggleBtns = document.querySelectorAll('[data-theme-toggle="toggle"]');

    // localStorage puede lanzar (modo privado / cookies bloqueadas)
    const readTheme = () => {
        try {
            return localStorage.getItem(THEME_KEY);
        } catch {
            return null;
        }
    };
    const saveTheme = (theme) => {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            /* sin persistencia: el tema igual se aplica en esta sesión */
        }
    };
    const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

    const applyTheme = (theme) => {
        const isDark = theme === 'dark' || (theme === 'auto' && prefersDark());
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.dataset.theme = theme;
        toggleBtns.forEach(btn => {
            btn.setAttribute('aria-pressed', String(isDark));
            btn.setAttribute('title', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        });
    };

    // Por defecto, usar la preferencia del sistema del usuario
    const initialTheme = readTheme() || 'auto';
    applyTheme(initialTheme);

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const current = document.documentElement.classList.contains('dark');
            const next = current ? 'light' : 'dark';
            saveTheme(next);
            applyTheme(next);
        });
    });

    // Reaccionar a cambios del SO cuando está en 'auto'
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if ((readTheme() || 'auto') === 'auto') applyTheme('auto');
    });

    // 8. COTIZADOR DE PRECIOS (dólar bajo demanda: solo al interactuar)
    const selectServicio = document.getElementById('asunto');
    const displayPrecio = document.getElementById('precio-estimado');
    const containerPrecio = document.getElementById('precio-estimado-container');
    const mensajePrecio = document.getElementById('precio-mensaje');

    const DOLAR_FALLBACK = 1450; // valor base, NO es una cotización real
    const serviciosPrecios = {
        landing: 250,
        ecommerce: 550,
        automatizacion: 350,
        mantenimiento: 50
    };

    let cotizacionDolar = null;  // valor real, null hasta que responde la API
    let dolarCargado = false;     // tenemos cotización real
    let dolarFallido = false;     // falló el fetch (se puede reintentar)
    let dolarEnCurso = false;     // hay una request en vuelo

    const formatARS = (n) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(n);

    // Renderiza el precio estimado con la cotización que haya disponible.
    // Se llama en cada `change` y también cuando la promesa del dólar resuelve o falla.
    const renderPrecio = () => {
        if (!selectServicio || !displayPrecio || !containerPrecio) return;

        const svc = selectServicio.value;
        const precioUSD = serviciosPrecios[svc];

        if (!precioUSD) {
            containerPrecio.classList.add('hidden');
            return;
        }

        const usandoFallback = cotizacionDolar === null;
        const totalARS = precioUSD * (usandoFallback ? DOLAR_FALLBACK : cotizacionDolar);

        displayPrecio.textContent = formatARS(totalARS);

        if (!mensajePrecio) return;
        if (!usandoFallback) {
            mensajePrecio.textContent = `Cotización Blue: $${cotizacionDolar}`;
        } else if (dolarFallido) {
            mensajePrecio.textContent = '⚠️ Precio estimado con cotización base (no se pudo consultar el dólar blue)';
        } else {
            mensajePrecio.textContent = '⏳ Cotización del dólar blue en curso…';
        }
        if (svc === 'mantenimiento') mensajePrecio.textContent += ' (Costo mensual)';

        containerPrecio.classList.remove('hidden');
    };

    const fetchDolarBlue = async () => {
        if (dolarCargado || dolarEnCurso) return;
        dolarEnCurso = true;
        try {
            const res = await fetch('https://dolarapi.com/v1/dolares/blue', {
                signal: AbortSignal.timeout(8000)
            });
            if (!res.ok) throw new Error(`dolarapi HTTP ${res.status}`);
            const data = await res.json();
            const compra = Number(data?.compra);
            if (!Number.isFinite(compra) || compra <= 0) throw new Error('Cotización inválida');
            cotizacionDolar = compra;
            dolarCargado = true;
            dolarFallido = false;
        } catch (e) {
            console.warn('Usando cotización fallback:', e);
            cotizacionDolar = null;
            dolarCargado = false;
            dolarFallido = true; // se puede reintentar en la próxima interacción
        } finally {
            dolarEnCurso = false;
        }
        // La cotización recién llegada cambia el precio: hay que recalcular
        renderPrecio();
    };

    if (selectServicio) {
        selectServicio.addEventListener('focus', fetchDolarBlue);
        selectServicio.addEventListener('click', fetchDolarBlue);

        selectServicio.addEventListener('change', () => {
            renderPrecio();
            // Si la cotización todavía no llegó (o falló), se intenta de nuevo
            fetchDolarBlue();
        });
    }

    // 9. GAUCHO ANIMATOR
    setTimeout(() => {
        if (typeof GauchoAnimator !== 'undefined') {
            new GauchoAnimator('gaucho-container');
        }
    }, 500);
});
