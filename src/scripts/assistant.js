// Asistente de ventas de Matecito Tech. Todo corre en el navegador del visitante:
// 1) Si el navegador trae un modelo de IA local ya instalado (Chrome: API
//    LanguageModel / Gemini Nano) lo usa, sin servidores ni costo.
// 2) Si no, responde con un motor de intenciones sobre la información real del
//    estudio. En ambos casos el objetivo es el mismo: resolver la duda y llevar
//    la conversación a un presupuesto por WhatsApp o por el formulario.

const WHATSAPP = '543425370985';

const SERVICIOS = {
    landing: { nombre: 'Página web', precio: 'desde USD 250 (pago único)' },
    ecommerce: { nombre: 'Tienda online', precio: 'desde USD 550 (pago único)' },
    automatizacion: { nombre: 'Sistema a medida', precio: 'desde USD 350 (pago único)' },
    mantenimiento: { nombre: 'Mantenimiento', precio: 'USD 50 por mes' },
};

// Base de conocimiento (fuente: el sitio y la documentación interna de Matecito)
const KB = [
    {
        id: 'precio',
        keys: ['precio', 'cuesta', 'cuanto cuesta', 'cuanto sale', 'cuanto cobran', 'valor', 'presupuesto', 'cobran', 'tarifa', 'barato', 'caro', 'plata', 'pesos', 'dolar', 'usd'],
        answer: 'Estos son los precios de arranque:\n• Página web: desde USD 250\n• Sistema a medida: desde USD 350\n• Tienda online: desde USD 550\n• Mantenimiento: USD 50 por mes\n\nTambién cobramos en pesos al valor del día. El presupuesto exacto es sin cargo y te lo pasamos por escrito.',
        chips: ['¿Qué incluye la página web?', '¿Cuánto tarda?', 'Quiero un presupuesto'],
        close: true,
    },
    {
        id: 'web',
        servicio: 'landing',
        keys: ['pagina', 'web', 'sitio', 'landing', 'google', 'aparecer', 'presencia', 'dominio', 'seo'],
        answer: 'Una página web arranca en USD 250 e incluye diseño a medida adaptado a celulares, botón de WhatsApp con el mensaje armado, SEO base con alta en Google, y dominio y hosting configurados. El dominio y el sitio quedan a tu nombre.',
        chips: ['¿Cuánto tarda?', 'Ver un caso real', 'Quiero un presupuesto'],
        close: true,
    },
    {
        id: 'tienda',
        servicio: 'ecommerce',
        keys: ['tienda', 'ecommerce', 'e-commerce', 'vender', 'venta', 'catalogo', 'productos', 'mercado pago', 'mercadopago', 'tiendanube', 'woocommerce', 'online', 'carrito', 'envio'],
        answer: 'Una tienda online arranca en USD 550: catálogo autogestionable, cobros con Mercado Pago, envíos integrados y un panel para ver tus pedidos. Según tu presupuesto la armamos en Tiendanube, WooCommerce o a medida, y te recomendamos la que más te conviene.',
        chips: ['¿Tiendanube o a medida?', '¿Cuánto tarda?', 'Quiero un presupuesto'],
        close: true,
    },
    {
        id: 'plataforma',
        servicio: 'ecommerce',
        keys: ['tiendanube o', 'a medida o', 'cual conviene', 'que plataforma', 'shopify', 'wordpress'],
        answer: 'Tiendanube o WooCommerce son ideales para salir rápido y con menor inversión. Una tienda a medida conviene cuando necesitás integraciones propias (stock, facturación, mayoristas) o querés escalar sin pagar comisiones de plataforma. Contanos tu caso y te decimos cuál conviene.',
        chips: ['Quiero un presupuesto', 'Precios'],
        close: true,
    },
    {
        id: 'sistema',
        servicio: 'automatizacion',
        keys: ['sistema', 'turnos', 'stock', 'inventario', 'clientes', 'gestion', 'automatizar', 'automatizacion', 'planilla', 'excel', 'facturacion', 'reservas', 'agenda', 'crm', 'app'],
        answer: 'Un sistema a medida arranca en USD 350. Relevamos cómo trabajás y armamos la herramienta para tu proceso: turnos, stock, clientes o facturación, con acceso desde la compu o el celular, usuarios y permisos, y capacitación al equipo. Menos planillas, menos errores.',
        chips: ['¿Cuánto tarda?', 'Quiero un presupuesto'],
        close: true,
    },
    {
        id: 'mantenimiento',
        servicio: 'mantenimiento',
        keys: ['mantenimiento', 'soporte', 'actualizacion', 'actualizar', 'seguridad', 'backup', 'copia', 'cambios', 'despues'],
        answer: 'El mantenimiento cuesta USD 50 por mes: actualizaciones y seguridad, copias de seguridad, cambios menores de contenido y soporte por WhatsApp o email. Es opcional; después del lanzamiento igual te acompañamos en la puesta en marcha.',
        chips: ['Quiero un presupuesto', 'Precios'],
        close: true,
    },
    {
        id: 'plazo',
        keys: ['tarda', 'cuanto tarda', 'tiempo', 'plazo', 'cuando', 'demora', 'semanas', 'rapido', 'urgente', 'listo'],
        answer: 'Depende del alcance. En la propuesta te damos un plazo concreto antes de empezar, y como trabajamos en sprints semanales, cada semana ves avances reales en vez de esperar hasta el final.',
        chips: ['¿Cómo trabajan?', 'Quiero un presupuesto'],
        close: true,
    },
    {
        id: 'proceso',
        keys: ['como trabajan', 'proceso', 'metodologia', 'scrum', 'pasos', 'empezar', 'arrancar', 'avance', 'reuniones', 'tablero'],
        answer: 'Son cuatro pasos:\n1. Nos contás tu idea (formulario o WhatsApp).\n2. Recibís una propuesta con alcance, plazo y precio, sin cargo.\n3. Ves avances cada semana y tenés acceso al tablero del proyecto.\n4. Lanzamos, te enseñamos a usarlo y quedamos a mano.',
        chips: ['Precios', 'Quiero un presupuesto'],
        close: true,
    },
    {
        id: 'zona',
        keys: ['humboldt', 'rafaela', 'esperanza', 'santa fe', 'zona', 'donde', 'ubicados', 'provincia', 'remoto', 'distancia', 'exterior', 'cordoba', 'buenos aires', 'rosario'],
        answer: 'Estamos en Humboldt, Santa Fe. Trabajamos con negocios de Rafaela, Esperanza, Santa Fe y toda la región, y también con clientes de otras provincias y del exterior: todo el proceso se puede hacer a distancia.',
        chips: ['Precios', 'Quiero un presupuesto'],
    },
    {
        id: 'caso',
        keys: ['caso', 'ejemplo', 'trabajos', 'portfolio', 'portafolio', 'clientes reales', 'schalbetter', 'hicieron', 'proyecto real'],
        answer: 'Un caso real: Schalbetter Transportes, empresa familiar de San Martín de las Escobas que viaja a Argentina, Chile, Uruguay y Bolivia. No tenían sitio y todo pasaba por Instagram y Facebook. Les hicimos un sitio propio con su historia, cotización por WhatsApp con un botón y una sección para sumar choferes.',
        actions: [{ label: 'Ver el sitio', href: 'https://schalbettertransportes.com.ar/' }],
        chips: ['Quiero algo así', 'Precios'],
        close: true,
    },
    {
        id: 'quienes',
        keys: ['quienes', 'quien', 'matecito', 'equipo', 'mateo', 'empresa', 'confianza', 'experiencia'],
        answer: 'Matecito Tech es un estudio de software de Humboldt fundado por Mateo Gariboglio, desarrollador backend (Java y Spring) y Scrum Master. Sumamos especialistas según cada proyecto. Nuestra misión: que los comercios de la región compitan de igual a igual con las grandes empresas.',
        chips: ['Ver un caso real', 'Precios'],
    },
    {
        id: 'pago',
        keys: ['pago', 'pagar', 'cuotas', 'anticipo', 'transferencia', 'factura'],
        answer: 'Las condiciones de pago se acuerdan en la propuesta, antes de empezar. Cobramos en dólares o en pesos al valor del día. Si querés, te pasamos con una persona para verlo en detalle.',
        chips: ['Quiero un presupuesto'],
        close: true,
    },
    {
        id: 'propiedad',
        keys: ['mio', 'propiedad', 'codigo', 'dueño', 'dueno', 'github', 'llevar'],
        answer: 'El dominio y el sitio quedan a tu nombre. Trabajamos con código prolijo y documentado (podés ver nuestro trabajo en GitHub), así que nunca quedás atado.',
        chips: ['Precios', 'Quiero un presupuesto'],
    },
    {
        id: 'contratar',
        keys: ['quiero', 'presupuesto', 'contratar', 'contacto', 'hablar', 'whatsapp', 'llamar', 'telefono', 'mail', 'email', 'persona', 'humano', 'asesor', 'algo asi'],
        answer: 'Perfecto. Te armo un mensaje con lo que hablamos para que lo mandes por WhatsApp, o si preferís lo dejo cargado en el formulario. Respondemos con los próximos pasos.',
        close: 'now',
    },
    {
        id: 'saludo',
        keys: ['hola', 'buenas', 'buen dia', 'buenas tardes', 'que tal', 'como va'],
        answer: '¡Hola! ¿Qué necesitás para tu negocio? Puedo contarte precios, cómo trabajamos o ayudarte a elegir entre página web, tienda online o un sistema a medida.',
        chips: ['Precios', 'Necesito vender online', 'Ordenar turnos o stock'],
    },
    {
        id: 'gracias',
        keys: ['gracias', 'genial', 'buenisimo', 'perfecto', 'dale', 'joya'],
        answer: '¡De nada! Cuando quieras, te armo el mensaje para WhatsApp con lo que hablamos y seguimos por ahí.',
        close: 'now',
    },
];

const FALLBACK = 'Esa te la respondemos mejor en persona. ¿Te armo un mensaje para WhatsApp con tu consulta? Mientras, puedo contarte precios, plazos o cómo trabajamos.';

const SYSTEM_PROMPT = `Sos el asistente de ventas de Matecito Tech, un estudio de desarrollo de software de Humboldt, Santa Fe, Argentina.
Hablás en español rioplatense (voseo), cálido, claro y breve: máximo 3 oraciones o una lista corta. Nunca inventes datos: si no sabés algo, ofrecé pasar la consulta por WhatsApp.
Datos verificados:
- Servicios y precios de arranque: página web desde USD 250 (diseño a medida para celular, botón de WhatsApp, SEO base y alta en Google, dominio y hosting); sistema a medida desde USD 350 (turnos, stock, clientes, facturación); tienda online desde USD 550 (catálogo autogestionable, Mercado Pago, envíos; en Tiendanube, WooCommerce o a medida); mantenimiento USD 50 por mes. También digitalización y consultoría. Se cobra en dólares o en pesos al valor del día. Presupuesto sin cargo y por escrito.
- Proceso: 1) el cliente cuenta su idea, 2) recibe propuesta con alcance, plazo y precio, 3) sprints semanales con avances visibles y acceso al tablero, 4) lanzamiento y acompañamiento. Plazos: se definen en la propuesta según el alcance.
- Zona: Humboldt, Rafaela, Esperanza, Santa Fe, otras provincias y el exterior, todo a distancia.
- Caso real: Schalbetter Transportes (sitio propio, cotización por WhatsApp, sección para choferes).
- Fundador: Mateo Gariboglio, backend Java/Spring y Scrum Master. El dominio y el sitio quedan a nombre del cliente.
Objetivo: entender qué necesita la persona (rubro y problema), recomendar el servicio adecuado y terminar invitándola a pedir el presupuesto sin cargo.`;

// ---------- utilidades ----------
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:()"]/g, ' ');

const classify = (text) => {
    const t = ` ${norm(text)} `;
    let best = null;
    let bestScore = 0;
    for (const item of KB) {
        let score = 0;
        for (const k of item.keys) if (t.includes(norm(k))) score += k.includes(' ') ? 3 : 1;
        if (score > bestScore) {
            best = item;
            bestScore = score;
        }
    }
    return best;
};

// Rubro del negocio ("tengo una ferretería", "soy contadora"...)
const detectRubro = (text) => {
    const m = text.match(/\b(?:tengo|tenemos|manejo|soy|somos)\s+((?:(?:una|unas|unos|un|el|la)\s+)?[a-záéíóúñü][\wáéíóúñü ]{2,40})/i);
    return m ? m[1].trim().replace(/\s+(y|que|pero|con)\s.*$/i, '') : null;
};

// ---------- motor ----------
export async function start(panel) {
    const log = panel.querySelector('[data-chat-log]');
    const chipsBox = panel.querySelector('[data-chat-chips]');
    const form = panel.querySelector('[data-chat-form]');
    const input = panel.querySelector('#chat-input');
    const status = panel.querySelector('[data-chat-status]');

    const lead = { servicio: null, rubro: null, preguntas: [] };
    let closingOffered = false;
    let session = null;

    // IA local del navegador: solo si el modelo YA está descargado (no forzamos descargas pesadas)
    try {
        const LM = globalThis.LanguageModel;
        const opts = { expectedInputs: [{ type: 'text', languages: ['es'] }], expectedOutputs: [{ type: 'text', languages: ['es'] }] };
        if (LM && (await LM.availability(opts)) === 'available') {
            session = await LM.create({ ...opts, initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }] });
            if (status) status.textContent = 'IA local activa: tus mensajes no salen de tu dispositivo';
        }
    } catch {
        session = null;
    }

    const scrollDown = () => log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });

    const addMsg = (who, text = '') => {
        const el = document.createElement('div');
        el.className = `msg msg--${who}`;
        el.textContent = text;
        log.appendChild(el);
        scrollDown();
        return el;
    };

    const setChips = (chips = []) => {
        chipsBox.replaceChildren(...chips.map((c) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = c;
            b.addEventListener('click', () => handle(c));
            return b;
        }));
    };

    const summary = () => {
        const svc = lead.servicio ? SERVICIOS[lead.servicio].nombre : null;
        const parts = ['¡Hola Matecito Tech! Vengo de la web.'];
        if (lead.rubro) parts.push(`Tengo ${lead.rubro}.`);
        if (svc) parts.push(`Me interesa: ${svc}.`);
        const qs = lead.preguntas.filter((q) => q.length > 12).slice(-2);
        if (qs.length) parts.push(`Mi consulta: ${qs.join(' / ')}`);
        parts.push('¿Me pasan un presupuesto?');
        return parts.join(' ');
    };

    const addActions = (el, actions) => {
        const box = document.createElement('div');
        box.className = 'msg__actions';
        for (const a of actions) {
            const node = a.href ? document.createElement('a') : document.createElement('button');
            node.textContent = a.label;
            if (a.alt) node.className = 'alt';
            if (a.href) {
                node.href = a.href;
                node.target = '_blank';
                node.rel = 'noopener';
            } else {
                node.type = 'button';
                node.addEventListener('click', a.onClick);
            }
            box.appendChild(node);
        }
        el.appendChild(box);
        scrollDown();
    };

    const offerClose = (el) => {
        closingOffered = true;
        addActions(el, [
            { label: 'Seguir por WhatsApp', href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(summary())}` },
            { label: 'Usar el formulario', alt: true, onClick: fillForm },
        ]);
    };

    function fillForm() {
        const select = document.getElementById('asunto');
        const msg = document.getElementById('mensaje');
        if (select && lead.servicio) {
            select.value = lead.servicio;
            select.dispatchEvent(new Event('change'));
        }
        if (msg && !msg.value) msg.value = summary().replace(/^¡Hola Matecito Tech! Vengo de la web\. /, '');
        document.dispatchEvent(new Event('chat:close'));
        document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => document.getElementById('nombre')?.focus({ preventScroll: true }), 700);
    }

    const typing = () => {
        const el = addMsg('bot');
        el.innerHTML = '<span class="typing" aria-label="Escribiendo"><i></i><i></i><i></i></span>';
        return el;
    };

    async function handle(raw) {
        const text = raw.trim();
        if (!text) return;
        addMsg('user', text);
        document.dispatchEvent(new CustomEvent('ronda:logro', { detail: 'asistente' }));
        setChips([]);
        lead.preguntas.push(text);
        lead.rubro ??= detectRubro(text);

        const intent = classify(text);
        if (intent?.servicio) lead.servicio = intent.servicio;
        if (/vender online|tienda/i.test(text)) lead.servicio ??= 'ecommerce';
        if (/turnos|stock/i.test(text)) lead.servicio ??= 'automatizacion';

        const el = typing();

        // Atajos que siempre resuelve el motor local (acciones de cierre y casos)
        const localOnly = intent && ['contratar', 'caso', 'gracias'].includes(intent.id);

        if (session && !localOnly) {
            try {
                el.textContent = '';
                const stream = session.promptStreaming(text);
                let out = '';
                for await (const chunk of stream) {
                    // Las versiones nuevas entregan deltas; las viejas, el texto acumulado
                    out = chunk.startsWith(out) ? chunk : out + chunk;
                    el.textContent = out;
                    scrollDown();
                }
                if (intent?.close || lead.preguntas.length >= 3) {
                    if (!closingOffered || intent?.close === 'now') offerClose(el);
                }
                setChips(intent?.chips ?? ['Precios', '¿Cuánto tarda?', 'Quiero un presupuesto']);
                return;
            } catch {
                session = null; // si la IA local falla, seguimos con el motor local
            }
        }

        await new Promise((r) => setTimeout(r, 350 + Math.min(text.length * 8, 450)));
        el.textContent = intent ? intent.answer : FALLBACK;
        if (intent?.actions) addActions(el, intent.actions);
        if (!intent || intent.close === 'now' || (intent.close && (lead.preguntas.length >= 2 || !closingOffered))) offerClose(el);
        setChips(intent?.chips ?? ['Precios', '¿Cómo trabajan?', 'Ver un caso real']);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = input.value;
        input.value = '';
        handle(v);
    });

    addMsg('bot', '¡Hola! Soy el asistente de Matecito Tech. Contame qué necesitás para tu negocio y te digo cómo te podemos ayudar y cuánto cuesta.');
    setChips(['Precios', 'Necesito vender online', 'Ordenar turnos o stock', 'Quiero aparecer en Google']);
}
