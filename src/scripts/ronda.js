// La ronda de mate: registra logros, actualiza el dock y festeja.
// Solo usa localStorage (almacenamiento funcional, no sale del navegador).

const KEY = 'ronda-mate-v1';
const TOTAL = 5;
const LABELS = {
    historia: 'Conociste nuestra historia',
    casos: 'Viste un proyecto real',
    precios: 'Miraste los precios',
    gaucho: 'Le cebaste un mate al gaucho',
    asistente: 'Charlaste con el asistente',
};

const read = () => {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
};
const save = (set) => {
    try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch { /* modo privado: la ronda dura la sesión */ }
};

const done = read();
const pill = document.querySelector('[data-ronda-pill]');
const count = document.querySelector('[data-ronda-count]');
const fill = document.querySelector('[data-ronda-fill]');
const bar = document.querySelector('[data-ronda-bar]');
const premio = document.querySelector('[data-ronda-premio]');
const pop = document.getElementById('ronda');

const render = () => {
    const n = done.size;
    if (count) count.textContent = `${n}/${TOTAL}`;
    // El mate se llena de abajo hacia arriba (la yerba ocupa de y=244 a y=564)
    fill?.setAttribute('y', String(564 - (320 * n) / TOTAL));
    bar?.setAttribute('aria-valuenow', String(n));
    bar?.style.setProperty('--p', `${(n / TOTAL) * 100}%`);
    document.querySelectorAll('[data-logro]').forEach((li) => {
        const ok = done.has(li.getAttribute('data-logro'));
        li.classList.toggle('is-done', ok);
        const state = li.querySelector('[data-logro-state]');
        if (state) state.textContent = ok ? 'logrado' : 'pendiente';
    });
    if (premio) premio.hidden = n < TOTAL;
};

const toast = (msg) => {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast';
    const span = document.createElement('span');
    span.className = 'font-medium';
    t.append(span);
    c.appendChild(t);
    span.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3800);
};

export const logro = (id) => {
    if (!LABELS[id] || done.has(id)) return;
    done.add(id);
    save(done);
    render();
    pill?.classList.remove('is-pop');
    void pill?.offsetWidth; // reinicia la animación
    pill?.classList.add('is-pop');
    if (done.size === TOTAL) {
        toast('🧉 ¡Ronda completa! Te ganaste un diagnóstico sin cargo.');
        // Si el chat está abierto, el premio espera a que se cierre
        const chat = document.getElementById('chat');
        const show = () => { try { pop?.showPopover(); } catch { /* sin soporte de popover */ } };
        if (chat && !chat.hidden) document.addEventListener('chat:closed', show, { once: true });
        else show();
    } else {
        toast(`🧉 Mate cebado (${done.size}/${TOTAL}): ${LABELS[id]}.`);
    }
};

render();
document.addEventListener('ronda:logro', (e) => logro(e.detail));

// Secciones: cuentan cuando se ven de verdad (la mitad en pantalla)
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            logro(entry.target.id);
            io.unobserve(entry.target);
        }
    }, { threshold: 0.35 });
    ['historia', 'casos', 'precios'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && !done.has(id)) io.observe(el);
    });
}

// El dock de mobile aparece cuando la persona ya pasó el hero
const dock = document.querySelector('[data-dock]');
const hero = document.getElementById('inicio');
if (dock && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => dock.classList.toggle('is-ready', !e.isIntersecting), { threshold: 0.6 }).observe(hero);
} else {
    dock?.classList.add('is-ready');
}

// Cebarle un mate al gaucho: bocanadas + "+1"
const cebar = document.querySelector('[data-cebar]');
cebar?.addEventListener('click', () => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!calm) {
        for (let i = 0; i < 5; i++) {
            const p = document.createElement('span');
            p.className = 'cebar__puf';
            p.style.left = `${30 + Math.random() * 40}%`;
            p.style.top = `${10 + Math.random() * 20}%`;
            p.style.setProperty('--dx', `${(Math.random() - 0.3) * 40}px`);
            p.style.animationDelay = `${i * 90}ms`;
            cebar.appendChild(p);
            setTimeout(() => p.remove(), 1600);
        }
        const plus = document.createElement('span');
        plus.className = 'cebar__plus';
        plus.textContent = '¡Gracias!';
        plus.style.left = '20%';
        plus.style.top = '-10%';
        cebar.appendChild(plus);
        setTimeout(() => plus.remove(), 1400);
    }
    logro('gaucho');
});
