// Formularios de matecito.qzz.io: reciben los envíos del sitio y los mandan
// por mail con Email Routing. Rutas: POST /api/contacto, POST /api/arrepentimiento.
import { env } from "cloudflare:workers";
import { EmailMessage } from "cloudflare:email";

const SITE = "https://matecito.qzz.io";
const FROM = "formularios@matecito.qzz.io";
const TO = "matecito.tech@gmail.com";
const ORIGENES = [SITE, "https://www.matecito.qzz.io"];

type Campos = Record<string, string>;

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

// RFC 2047 / base64: asunto y cuerpo en UTF-8 sin romper acentos
const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64Lineas = (s: string) => b64(s).replace(/.{1,76}/g, "$&\r\n");

const armarMail = (asunto: string, cuerpo: string, replyTo?: string) => {
  const id = `${crypto.randomUUID()}@matecito.qzz.io`;
  const cabeceras = [
    `From: "Web Matecito Tech" <${FROM}>`,
    `To: <${TO}>`,
    replyTo ? `Reply-To: <${replyTo}>` : "",
    `Subject: =?UTF-8?B?${b64(asunto)}?=`,
    `Message-ID: <${id}>`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ].filter(Boolean);
  return `${cabeceras.join("\r\n")}\r\n\r\n${b64Lineas(cuerpo)}`;
};

const enviar = async (asunto: string, cuerpo: string, replyTo?: string) => {
  await env.MAIL.send(new EmailMessage(FROM, TO, armarMail(asunto, cuerpo, replyTo)));
};

const codigoArrepentimiento = () => {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const azar = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `ARR-${fecha}-${azar}`;
};

export default {
  async fetch(req: Request, _env: unknown, ctx: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
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

        // El mail sale en segundo plano: la persona no espera los ~8 s de Email Routing
        ctx.waitUntil(
          enviar(
            `Nueva consulta de ${nombre} (${servicio}) - Matecito Tech`,
            `Nombre: ${nombre}\nContacto: ${contacto}\nServicio: ${servicio}\n\nMensaje:\n${mensaje}\n\n--\nEnviado desde ${SITE}/#contacto`,
            esEmail(contacto) ? contacto : undefined,
          ).catch((err) => console.error("Error al enviar la consulta", err)),
        );
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
        await enviar(
          `[${codigo}] ${tipo} - ${nombre} - Matecito Tech`,
          `Código de identificación: ${codigo}\nTrámite: ${tipo}\n\nNombre: ${nombre}\nEmail: ${email}\nTeléfono: ${limpio(campos.telefono, 40) || "-"}\nServicio contratado: ${servicio}\nFecha de contratación: ${fecha}\n\nComentarios:\n${limpio(campos.comentarios, 3000) || "-"}\n\n--\nRes. SCI 424/2020: confirmar por email a la persona dentro de las 24 horas, citando el código.`,
          email,
        );
        return quiereJson
          ? json({ ok: true, codigo })
          : Response.redirect(`${SITE}/gracias/?tramite=${encodeURIComponent(tipo)}&codigo=${encodeURIComponent(codigo)}`, 303);
      }
    } catch (err) {
      console.error("Error al enviar el formulario", err);
      return json({ ok: false, error: "No se pudo enviar" }, 502);
    }

    return json({ ok: false, error: "Ruta inexistente" }, 404);
  },
};
