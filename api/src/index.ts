// Formularios de matecito.qzz.io: reciben los envíos del sitio y los mandan por
// mail con Gmail (SMTP + contraseña de aplicación, guardada como secreto del Worker).
// Rutas: POST /api/contacto, POST /api/arrepentimiento, GET /api/salud.
import { env } from "cloudflare:workers";
import { enviarSmtp, type Mail } from "./smtp";
import { avisoConsulta, confirmacionConsulta, avisoTramite, constanciaTramite, type Html } from "./emails";

const SITE = "https://matecito.qzz.io";
const CUENTA = "matecito.tech@gmail.com"; // remitente y destinatario de los avisos
const ORIGENES = [SITE, "https://www.matecito.qzz.io"];

type Campos = Record<string, string>;
type Ctx = { waitUntil(p: Promise<unknown>): void };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

const leerCampos = async (req: Request): Promise<Campos> => {
  const tipo = req.headers.get("content-type") ?? "";
  if (tipo.includes("application/json")) {
    const data = (await req.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? "")]));
  }
  const form = await req.formData();
  return Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
};

const limpio = (v: string | undefined, max = 2000) => (v ?? "").replace(/\r/g, "").trim().slice(0, max);
const esEmail = (v: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v);

const enviar = (mails: Mail[]) => {
  const pass = (env as unknown as { GMAIL_APP_PASSWORD?: string }).GMAIL_APP_PASSWORD;
  if (!pass) throw new Error("Falta el secreto GMAIL_APP_PASSWORD");
  return enviarSmtp(CUENTA, pass.replace(/\s/g, ""), mails);
};

const aviso = (subject: string, cuerpo: Html, replyTo?: string): Mail =>
  ({ from: CUENTA, fromName: "Web Matecito Tech", to: CUENTA, replyTo, subject, ...cuerpo });

const alCliente = (to: string, subject: string, cuerpo: Html): Mail =>
  ({ from: CUENTA, fromName: "Matecito Tech", to, replyTo: CUENTA, subject, ...cuerpo });

const codigoArrepentimiento = () => {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const azar = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `ARR-${fecha}-${azar}`;
};

export default {
  async fetch(req: Request, _env: unknown, ctx: Ctx): Promise<Response> {
    const url = new URL(req.url);
    const quiereJson = (req.headers.get("accept") ?? "").includes("application/json");

    if (url.pathname === "/api/salud") return json({ ok: true });
    if (req.method !== "POST") return json({ ok: false, error: "Método no permitido" }, 405);

    // Solo se aceptan envíos desde el propio sitio
    const origen = req.headers.get("origin") ?? (req.headers.get("referer") ?? "").replace(/^(https:\/\/[^/]+).*$/, "$1");
    if (!ORIGENES.includes(origen)) return json({ ok: false, error: "Origen no permitido" }, 403);

    let campos: Campos;
    try {
      campos = await leerCampos(req);
    } catch {
      return json({ ok: false, error: "Datos inválidos" }, 400);
    }
    // Campo trampa: si un bot lo completa, se responde OK sin enviar nada
    if (limpio(campos._honey)) return quiereJson ? json({ ok: true }) : Response.redirect(`${SITE}/gracias/`, 303);

    try {
      if (url.pathname === "/api/contacto") {
        const nombre = limpio(campos.nombre, 120);
        const contacto = limpio(campos.contacto, 160);
        const servicio = limpio(campos.servicio, 120) || "Consulta general";
        const mensaje = limpio(campos.mensaje, 5000);
        if (!nombre || !contacto || !mensaje) return json({ ok: false, error: "Faltan datos" }, 422);

        const conEmail = esEmail(contacto);
        const mails = [aviso(`Nueva consulta de ${nombre} (${servicio})`, avisoConsulta({ nombre, contacto, servicio, mensaje, esEmail: conEmail }), conEmail ? contacto : undefined)];
        if (conEmail) mails.push(alCliente(contacto, "Recibimos tu consulta - Matecito Tech", confirmacionConsulta({ nombre, servicio, mensaje })));
        // En segundo plano: la persona ve la confirmación al instante
        ctx.waitUntil(enviar(mails).catch((err) => console.error("Error al enviar la consulta", err)));
        return quiereJson ? json({ ok: true }) : Response.redirect(`${SITE}/gracias/`, 303);
      }

      if (url.pathname === "/api/arrepentimiento") {
        const tipo = limpio(campos.tipo, 60) || "Arrepentimiento";
        const nombre = limpio(campos.nombre, 120);
        const email = limpio(campos.email, 160);
        const servicio = limpio(campos.servicio, 200);
        const fecha = limpio(campos.fecha_contratacion, 20);
        if (!nombre || !esEmail(email) || !servicio || !fecha) return json({ ok: false, error: "Faltan datos" }, 422);

        const codigo = codigoArrepentimiento();
        const tramite = { codigo, tipo, nombre, email, servicio, fecha, telefono: limpio(campos.telefono, 40), comentarios: limpio(campos.comentarios, 3000) };
        // Es un trámite legal (Res. SCI 424/2020): se espera a que los mails salgan
        await enviar([
          aviso(`[${codigo}] ${tipo} - ${nombre}`, avisoTramite(tramite), email),
          alCliente(email, `Constancia de tu pedido de ${tipo.toLowerCase()} [${codigo}] - Matecito Tech`, constanciaTramite(tramite)),
        ]);
        return quiereJson
          ? json({ ok: true, codigo })
          : Response.redirect(`${SITE}/gracias/?tramite=${encodeURIComponent(tipo)}&codigo=${encodeURIComponent(codigo)}`, 303);
      }
    } catch (err) {
      console.error("Error al enviar el formulario", err);
      return quiereJson ? json({ ok: false, error: "No se pudo enviar" }, 502) : Response.redirect(`${SITE}/arrepentimiento/?error=1`, 303);
    }

    return json({ ok: false, error: "Ruta inexistente" }, 404);
  },
};
