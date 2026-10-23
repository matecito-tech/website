// Turnstile (anti-bots de Cloudflare) cargado bajo demanda: el script de
// Cloudflare se descarga recién cuando la persona interactúa con un formulario.
// En la mayoría de los casos no muestra nada; si duda, pide un clic.

const SITEKEY = '0x4AAAAAAFhwNnLF4OilWyYJ';
let carga = null;

const cargarScript = () => {
    carga ??= new Promise((resolve, reject) => {
        if (window.turnstile) return resolve(window.turnstile);
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.onload = () => resolve(window.turnstile);
        s.onerror = () => { carga = null; reject(new Error('No se pudo cargar la verificación')); };
        document.head.appendChild(s);
    });
    return carga;
};

// Prepara el widget del formulario (una vez) y devuelve una función que
// espera el token. El contenedor es un <div data-turnstile> dentro del form.
export function protegerFormulario(form) {
    const caja = form.querySelector('[data-turnstile]');
    if (!caja) return async () => '';
    let token = '';
    let esperando = [];
    let id = null;

    const preparar = async () => {
        if (id !== null) return;
        const ts = await cargarScript();
        id = ts.render(caja, {
            sitekey: SITEKEY,
            appearance: 'interaction-only',
            size: 'flexible',
            language: 'es',
            callback: (t) => { token = t; esperando.forEach(r => r(t)); esperando = []; },
            'expired-callback': () => { token = ''; },
        });
    };

    // Se arranca apenas la persona empieza a completar el formulario
    form.addEventListener('focusin', () => { preparar().catch(() => {}); }, { once: true });

    return async () => {
        await preparar();
        if (token) return token;
        return new Promise((resolve, reject) => {
            esperando.push(resolve);
            setTimeout(() => reject(new Error('La verificación tardó demasiado')), 20000);
        });
    };
}

// Después de un envío, el token ya se usó: se pide uno nuevo
export function reiniciar(form) {
    const caja = form.querySelector('[data-turnstile] iframe')?.closest('[data-turnstile]');
    if (caja && window.turnstile) window.turnstile.reset(caja);
}
