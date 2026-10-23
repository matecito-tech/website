// Comportamiento del sitio. Sin dependencias: se carga como módulo (diferido).
import './ronda.js';
import { protegerFormulario, reiniciar } from './turnstile.js';

const navbar = document.getElementById('navbar');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// 1. NAVBAR: borde/sombra al scrollear (rAF + passive)
let ticking = false;
const updateNav = () => {
    navbar?.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
};
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
    }
}, { passive: true });
// En el próximo cuadro: leer scrollY recién aplicado el tema forzaría un recálculo de diseño
requestAnimationFrame(updateNav);

// 2. SECCIÓN ACTIVA en el menú (aria-current), con IntersectionObserver
const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const linkFor = new Map(navLinks.map(a => [a.getAttribute('href')?.split('#')[1], a]));
// El hero también se observa: al volver arriba no queda ninguna sección marcada
const tracked = [...linkFor.keys(), 'inicio'].map(id => document.getElementById(id ?? '')).filter(Boolean);
if (tracked.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            navLinks.forEach(a => a.removeAttribute('aria-current'));
            linkFor.get(entry.target.id)?.setAttribute('aria-current', 'true');
        }
    }, { rootMargin: '-45% 0px -50% 0px' });
    tracked.forEach(s => io.observe(s));
}

// 3. TOASTS (la región viva es #toast-container; el error suma role="alert")
const TOAST_TIMEOUT = 5000;
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
    if (type === 'error') t.setAttribute('role', 'alert');

    const icon = svgEl('svg', { class: 'icon', 'aria-hidden': 'true', focusable: 'false' });
    icon.appendChild(svgEl('use', { href: `#i-${TOAST_ICONS[type] || 'info'}` }));

    const text = document.createElement('span');
    text.className = 'font-medium';

    // WCAG 2.2.1: el aviso se tiene que poder descartar
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'ml-auto shrink-0 rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors';
    close.setAttribute('aria-label', 'Cerrar aviso');
    const closeIcon = svgEl('svg', { class: 'icon', 'aria-hidden': 'true', focusable: 'false', viewBox: '0 0 24 24' });
    closeIcon.appendChild(svgEl('path', { d: 'M6 6l12 12M18 6L6 18', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }));
    close.appendChild(closeIcon);

    let timer = null;
    const dismiss = () => {
        clearTimeout(timer);
        t.classList.remove('show');
        setTimeout(() => t.remove(), 400);
    };
    close.addEventListener('click', dismiss);

    t.append(icon, text, close);
    c.appendChild(t);
    // El texto va DESPUÉS de insertar el nodo: si nace con contenido, muchos lectores no lo anuncian
    text.textContent = msg;

    requestAnimationFrame(() => t.classList.add('show'));
    timer = setTimeout(dismiss, TOAST_TIMEOUT);
};

// 4. MENÚ MÓVIL (aria-expanded, Esc, foco atrapado, cierre al tocar afuera)
const menuBtn = document.querySelector('[aria-controls="mobile-menu"]');
const menu = document.getElementById('mobile-menu');
const isMenuOpen = () => menuBtn?.getAttribute('aria-expanded') === 'true';

const closeMenu = (restoreFocus = false) => {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    menu.hidden = true;
    if (restoreFocus) menuBtn.focus();
};
const openMenu = () => {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Cerrar menú');
    menu.hidden = false;
    menu.querySelector('a')?.focus();
};

if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => (isMenuOpen() ? closeMenu() : openMenu()));

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isMenuOpen()) {
            e.preventDefault();
            closeMenu(true);
        }
    });

    menu.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const focusables = [...menu.querySelectorAll('a[href], button:not([disabled])')];
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));

    document.addEventListener('click', e => {
        if (!isMenuOpen()) return;
        const target = e.target;
        if (target instanceof Node && (menu.contains(target) || menuBtn.contains(target))) return;
        closeMenu();
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', e => {
        if (e.matches) closeMenu();
    });
}

// 5. TEMA claro / oscuro (respeta el sistema por defecto)
const THEME_KEY = 'theme';
const toggleBtns = document.querySelectorAll('[data-theme-toggle]');

const readTheme = () => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
};
const saveTheme = theme => {
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* sin persistencia en modo privado */ }
};
const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = theme => {
    const isDark = theme === 'dark' || (theme === 'auto' && prefersDark());
    const root = document.documentElement;
    root.classList.add('no-transitions');
    root.classList.toggle('dark', isDark);
    root.dataset.theme = theme;
    toggleBtns.forEach(btn => {
        btn.setAttribute('aria-pressed', String(isDark));
        btn.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
    });
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-transitions')));
};

applyTheme(readTheme() || 'auto');

toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        saveTheme(next);
        // View Transitions: el tema nuevo se abre en círculo desde el botón
        if (!document.startViewTransition || reducedMotion.matches) {
            applyTheme(next);
            return;
        }
        const r = btn.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const style = document.documentElement.style;
        style.setProperty('--vt-x', `${x}px`);
        style.setProperty('--vt-y', `${y}px`);
        style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
        document.startViewTransition(() => applyTheme(next));
    });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((readTheme() || 'auto') === 'auto') applyTheme('auto');
});

// 6. PRECIOS EN PESOS (dólar oficial, venta). Se consulta una sola vez,
//    cuando la persona se acerca a los precios o toca el formulario.
const selectServicio = document.getElementById('asunto');
const displayPrecio = document.getElementById('precio-estimado');
const containerPrecio = document.getElementById('precio-estimado-container');
const mensajePrecio = document.getElementById('precio-mensaje');
const serviciosPrecios = { landing: 250, ecommerce: 550, automatizacion: 350, mantenimiento: 50 };

const formatARS = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
let dolarPromise = null;
const getDolar = () => {
    dolarPromise ??= fetch('https://dolarapi.com/v1/dolares/oficial', { signal: AbortSignal.timeout(8000) })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(`dolarapi HTTP ${r.status}`))))
        .then(d => {
            const venta = Number(d?.venta);
            if (!Number.isFinite(venta) || venta <= 0) throw new Error('Cotización inválida');
            return venta;
        })
        .catch(() => { dolarPromise = null; return null; }); // se reintenta en la próxima interacción
    return dolarPromise;
};

const pintarPlanes = async () => {
    const dolar = await getDolar();
    if (!dolar) return;
    document.querySelectorAll('[data-ars-usd]').forEach(el => {
        const ars = Number(el.getAttribute('data-ars-usd')) * dolar;
        el.textContent = `≈ ${formatARS(ars)}${el.hasAttribute('data-ars-mes') ? ' por mes' : ''} al dólar oficial`;
    });
};
const precios = document.getElementById('precios');
if (precios && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { io.disconnect(); pintarPlanes(); }
    }, { rootMargin: '600px 0px' });
    io.observe(precios);
}

const renderPrecio = async () => {
    if (!selectServicio || !displayPrecio || !containerPrecio) return;
    const svc = selectServicio.value;
    const precioUSD = serviciosPrecios[svc];
    if (!precioUSD) {
        containerPrecio.hidden = true;
        return;
    }
    const mes = svc === 'mantenimiento' ? ' por mes' : '';
    displayPrecio.textContent = `desde USD ${precioUSD}${mes}`;
    if (mensajePrecio) mensajePrecio.textContent = 'Consultando la cotización del día…';
    containerPrecio.hidden = false;
    const dolar = await getDolar();
    if (selectServicio.value !== svc) return; // cambió mientras esperábamos
    if (dolar) {
        displayPrecio.textContent = `desde ${formatARS(precioUSD * dolar)}${mes}`;
        if (mensajePrecio) mensajePrecio.textContent = `Equivale a USD ${precioUSD} al dólar oficial de hoy (${formatARS(dolar)}). El precio final figura en el presupuesto.`;
    } else if (mensajePrecio) {
        mensajePrecio.textContent = 'No pudimos consultar la cotización: te pasamos el precio en pesos en el presupuesto.';
    }
};

if (selectServicio) {
    selectServicio.addEventListener('focus', getDolar, { once: true });
    selectServicio.addEventListener('change', renderPrecio);
}

// Botones de los planes: precargan el servicio en el formulario
document.querySelectorAll('[data-servicio]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!selectServicio) return;
        selectServicio.value = btn.getAttribute('data-servicio') ?? '';
        renderPrecio();
        // Foco al primer campo una vez terminado el scroll suave
        setTimeout(() => document.getElementById('nombre')?.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 700);
    });
});

// 7. FORMULARIO (Worker propio en /api/contacto; sin JS hace POST normal y redirige a /gracias/)
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('form-status');
const setFormStatus = msg => { if (formStatus) formStatus.textContent = msg; };

const BTN_HTML = {
    loading: '<svg class="icon animate-spin" aria-hidden="true" focusable="false"><use href="#i-refresh"/></svg><span>Enviando…</span>',
    success: '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-check_circle"/></svg><span>¡Recibido!</span>',
};

if (form) {
    const fields = {
        nombre: document.getElementById('nombre'),
        contacto: document.getElementById('contacto_dato'),
        mensaje: document.getElementById('mensaje'),
    };
    const CONTACTO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$|^\+?[0-9\s()-]{8,20}$/;
    const tokenTurnstile = protegerFormulario(form);

    // El aviso de error se limpia apenas la persona corrige el campo
    Object.values(fields).forEach(el => el?.addEventListener('input', () => el.removeAttribute('aria-invalid')));

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;

        const data = {
            nombre: fields.nombre?.value.trim() ?? '',
            contacto: fields.contacto?.value.trim() ?? '',
            servicio: selectServicio?.selectedOptions[0]?.textContent?.trim() || 'Consulta general',
            mensaje: fields.mensaje?.value.trim() ?? '',
        };

        const invalid = [];
        if (!data.nombre) invalid.push(fields.nombre);
        if (!CONTACTO_OK.test(data.contacto)) invalid.push(fields.contacto);
        if (!data.mensaje) invalid.push(fields.mensaje);
        if (invalid.length) {
            invalid.forEach(el => el?.setAttribute('aria-invalid', 'true'));
            invalid[0]?.focus();
            const msg = invalid[0] === fields.contacto
                ? 'Revisá el WhatsApp o email: lo necesitamos para responderte.'
                : 'Completá tu nombre, un contacto y tu idea para poder responderte.';
            showToast(msg, 'error');
            setFormStatus(msg);
            return;
        }

        const orig = btn.innerHTML;
        btn.innerHTML = BTN_HTML.loading;
        btn.disabled = true;
        setFormStatus('');

        try {
            // Worker propio en Cloudflare (api/): responde en milisegundos y manda el mail
            // Si Turnstile no carga, se envía igual y el Worker responde con un error claro
            const turnstile = await tokenTurnstile().catch(() => '');
            const res = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ ...data, turnstile, _honey: form.querySelector('[name="_honey"]')?.value ?? '' }),
                signal: AbortSignal.timeout(20000),
            });
            const d = await res.json().catch(() => ({}));
            if (!res.ok || !d?.ok) throw new Error(d?.error || `HTTP ${res.status}`);

            const ok = '¡Gracias! Recibimos tu consulta y te vamos a escribir pronto.';
            showToast(ok, 'success');
            setFormStatus(ok);
            btn.innerHTML = BTN_HTML.success;
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.disabled = false;
                form.reset();
                reiniciar(form);
                if (containerPrecio) containerPrecio.hidden = true;
            }, 4000);
        } catch (err) {
            console.error('Error al enviar el formulario:', err);
            reiniciar(form);
            const msg = err instanceof Error && /persona/.test(err.message)
                ? err.message
                : 'No se pudo enviar. Probá de nuevo o escribinos por WhatsApp o email.';
            showToast(msg, 'error');
            setFormStatus(msg);
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    });
}

// 8. APARICIONES (una sola vez), NÚMEROS QUE CUENTAN Y TABLERO VIVO
const motionOK = !reducedMotion.matches;
const revealables = document.querySelectorAll('.reveal, .reveal-stagger');
document.querySelectorAll('.reveal-stagger').forEach(group => {
    [...group.children].forEach((child, i) => child.style.setProperty('--i', String(Math.min(i, 8))));
});

// Cuenta de `from` a `to` con desaceleración (easeOutExpo), sin saltos de layout
const countUp = (el) => {
    const to = Number(el.getAttribute('data-count'));
    const from = Number(el.getAttribute('data-count-from') ?? 0);
    if (!Number.isFinite(to)) return;
    const t0 = performance.now(), dur = 1200;
    const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        el.textContent = String(Math.round(from + (to - from) * e));
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};

if ('IntersectionObserver' in window && motionOK) {
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('is-in');
            entry.target.querySelectorAll('[data-count]').forEach(countUp);
            io.unobserve(entry.target);
        }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(el => io.observe(el));
} else {
    revealables.forEach(el => el.classList.add('is-in'));
}

// Tablero de ejemplo: cada tanto una tarea avanza de columna (animación FLIP)
const board = document.querySelector('[data-board]');
if (board && motionOK && 'IntersectionObserver' in window) {
    const col = (name) => board.querySelector(`[data-board-col="${name}"]`);
    const ORDER = ['todo', 'doing', 'done'];
    const STATE = { todo: '', doing: 'board__card--doing', done: 'board__card--done' };
    let timer = 0;
    const advance = () => {
        const cards = [...board.querySelectorAll('.board__card')];
        const done = col('done');
        // Si todo está listo, se reinicia el sprint
        const pending = cards.filter(c => !c.classList.contains('board__card--done'));
        const card = pending.find(c => c.closest('[data-board-col]')?.getAttribute('data-board-col') === 'doing') ?? pending[0];
        if (!card || !done) {
            cards.forEach((c, i) => {
                const target = col(ORDER[i % 2]);
                c.className = `board__card ${STATE[ORDER[i % 2]]}`.trim();
                target?.appendChild(c);
            });
            return;
        }
        const from = card.getBoundingClientRect();
        const next = ORDER[ORDER.indexOf(card.closest('[data-board-col]')?.getAttribute('data-board-col') ?? 'todo') + 1] ?? 'done';
        col(next)?.appendChild(card);
        card.className = `board__card ${STATE[next]}`.trim();
        const to = card.getBoundingClientRect();
        card.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` }, { transform: 'none' }],
            { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
    };
    new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e.isIntersecting) timer = setInterval(advance, 2600);
    }).observe(board);
}
