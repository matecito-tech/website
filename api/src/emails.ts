// Plantillas de mail (HTML + texto). Pensadas para Gmail y Outlook: tablas,
// estilos en línea, sin fuentes web ni SVG. Todo lo que escribe el usuario
// pasa por `esc()` antes de entrar al HTML.

const SITE = "https://matecito.qzz.io";
const LOGO = `${SITE}/logo-512.png`;
const WHATSAPP = "543425370985";

const C = { crema: "#FDFBF7", tinta: "#1A120E", monte: "#1E3932", yerba: "#00704A", sol: "#F9BC3D", gris: "#5B6B66", linea: "#E6E2DA" };
const DISPLAY = "'Space Grotesk', 'Segoe UI', Arial, sans-serif";
const CUERPO = "Manrope, 'Segoe UI', Arial, sans-serif";

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const parrafos = (s: string) => esc(s).replace(/\n/g, "<br>");

export interface Html { html: string; text: string }

// ---------- piezas ----------
const boton = (href: string, label: string, alt = false) =>
  `<a href="${esc(href)}" style="display:inline-block;padding:13px 22px;border-radius:12px;font:700 15px/1 ${CUERPO};text-decoration:none;${alt ? `color:${C.monte};border:1px solid ${C.linea};background:#fff` : `color:#fff;background:${C.yerba}`}">${esc(label)}</a>`;

const datos = (filas: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0">${filas
    .map(([k, v]) => `<tr><td style="padding:10px 0;border-top:1px solid ${C.linea};font:600 13px/1.4 ${CUERPO};color:${C.gris};width:38%;vertical-align:top">${esc(k)}</td><td style="padding:10px 0;border-top:1px solid ${C.linea};font:15px/1.5 ${CUERPO};color:${C.tinta};vertical-align:top">${parrafos(v)}</td></tr>`)
    .join("")}</table>`;

const cita = (titulo: string, texto: string) =>
  `<p style="margin:24px 0 8px;font:600 13px/1.4 ${CUERPO};color:${C.gris}">${esc(titulo)}</p><div style="border-left:3px solid ${C.yerba};background:${C.crema};padding:14px 16px;border-radius:0 10px 10px 0;font:15px/1.6 ${CUERPO};color:${C.tinta}">${parrafos(texto)}</div>`;

// Talón de boleto: el código del trámite, para que se lea como comprobante
const talon = (codigo: string, detalle: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:2px dashed ${C.monte};border-radius:14px;background:#FFF6DC"><tr><td style="padding:18px 20px"><p style="margin:0;font:600 13px/1.4 ${CUERPO};color:${C.monte}">Código de identificación</p><p style="margin:6px 0 4px;font:700 22px/1.2 ${DISPLAY};letter-spacing:.02em;white-space:nowrap;color:${C.tinta}">${esc(codigo)}</p><p style="margin:0;font:13px/1.5 ${CUERPO};color:${C.gris}">${esc(detalle)}</p></td></tr></table>`;

const plantilla = (o: { preheader: string; titulo: string; cuerpo: string; pie?: string }) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(o.titulo)}</title></head>
<body style="margin:0;padding:0;background:${C.crema}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.crema}"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="padding:0 8px 18px"><a href="${SITE}" style="text-decoration:none"><img src="${LOGO}" width="30" height="30" alt="" style="vertical-align:middle;border:0"><span style="vertical-align:middle;margin-left:8px;font:700 18px/1 ${DISPLAY};color:${C.tinta}">Matecito <span style="font-weight:500;color:${C.gris}">Tech</span></span></a></td></tr>
    <tr><td style="background:#fff;border:1px solid ${C.linea};border-radius:18px;padding:32px 28px">
      <h1 style="margin:0 0 14px;font:700 24px/1.2 ${DISPLAY};letter-spacing:-.01em;color:${C.monte}">${esc(o.titulo)}</h1>
      ${o.cuerpo}
    </td></tr>
    <tr><td style="padding:20px 8px 0;font:13px/1.6 ${CUERPO};color:${C.gris}">${o.pie ?? `Matecito Tech, software a medida desde Humboldt, Santa Fe.<br><a href="${SITE}" style="color:${C.yerba}">matecito.qzz.io</a> &nbsp;|&nbsp; <a href="https://wa.me/${WHATSAPP}" style="color:${C.yerba}">WhatsApp +54 342 537-0985</a>`}</td></tr>
  </table>
</td></tr></table></body></html>`;

const p = (s: string) => `<p style="margin:0 0 14px;font:16px/1.6 ${CUERPO};color:${C.tinta}">${s}</p>`;
const whatsappDe = (contacto: string) => {
  const digitos = contacto.replace(/\D/g, "");
  return digitos.length >= 8 ? `https://wa.me/${digitos.startsWith("54") ? digitos : `54${digitos}`}` : null;
};

// ---------- mails ----------
export const avisoConsulta = (d: { nombre: string; contacto: string; servicio: string; mensaje: string; esEmail: boolean }): Html => {
  const wa = d.esEmail ? null : whatsappDe(d.contacto);
  const accion = d.esEmail
    ? boton(`mailto:${d.contacto}?subject=${encodeURIComponent("Tu consulta a Matecito Tech")}`, `Responder a ${d.nombre}`)
    : wa ? boton(wa, `Escribirle por WhatsApp`) : "";
  return {
    html: plantilla({
      preheader: `${d.servicio}: ${d.mensaje.slice(0, 90)}`,
      titulo: `Nueva consulta de ${d.nombre}`,
      cuerpo: `${p(`Llegó desde el formulario de contacto del sitio.`)}${datos([["Contacto", d.contacto], ["Servicio", d.servicio]])}${cita("Mensaje", d.mensaje)}${accion ? `<div style="margin-top:26px">${accion}</div>` : ""}`,
      pie: `Aviso automático del formulario de <a href="${SITE}/#contacto" style="color:${C.yerba}">matecito.qzz.io</a>.`,
    }),
    text: `Nueva consulta de ${d.nombre}\n\nContacto: ${d.contacto}\nServicio: ${d.servicio}\n\nMensaje:\n${d.mensaje}\n\n--\nEnviado desde ${SITE}/#contacto`,
  };
};

export const confirmacionConsulta = (d: { nombre: string; servicio: string; mensaje: string }): Html => ({
  html: plantilla({
    preheader: "Te respondemos a la brevedad con los próximos pasos.",
    titulo: `¡Gracias, ${d.nombre}! Recibimos tu consulta`,
    cuerpo: `${p(`Ya la estamos leyendo. Te vamos a escribir a la brevedad para entender bien lo que necesitás.`)}${cita(`Tu consulta sobre ${d.servicio}`, d.mensaje)}
      <p style="margin:26px 0 10px;font:700 16px/1.3 ${DISPLAY};color:${C.monte}">Qué pasa ahora</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px">
        ${["Te escribimos para entender bien tu idea.", "Te mandamos una propuesta con alcance, plazo y precio, sin cargo.", "Si te cierra, arrancamos. Si no, no pasa nada."]
          .map((t, i) => `<tr><td style="vertical-align:top;padding:0 12px 10px 0;font:700 15px/1.5 ${DISPLAY};color:${C.yerba}">${i + 1}</td><td style="vertical-align:top;padding:0 0 10px;font:15px/1.5 ${CUERPO};color:${C.tinta}">${t}</td></tr>`).join("")}
      </table>
      <div style="margin-top:22px">${boton(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola Matecito Tech, soy ${d.nombre}. Les escribí desde la web.`)}`, "Escribinos por WhatsApp")}</div>`,
  }),
  text: `¡Gracias, ${d.nombre}! Recibimos tu consulta sobre "${d.servicio}".\n\nTe vamos a responder a la brevedad con los próximos pasos.\n\nTu mensaje:\n${d.mensaje}\n\n--\nMatecito Tech\n${SITE}\nWhatsApp: +54 342 537-0985`,
});

type Tramite = { codigo: string; tipo: string; nombre: string; email: string; telefono: string; servicio: string; fecha: string; comentarios: string };
const filasTramite = (d: Tramite): [string, string][] => [
  ["Trámite", d.tipo], ["Nombre", d.nombre], ["Email", d.email], ["Teléfono", d.telefono || "-"],
  ["Servicio contratado", d.servicio], ["Fecha de contratación", d.fecha], ["Comentarios", d.comentarios || "-"],
];
const textoTramite = (d: Tramite) => filasTramite(d).map(([k, v]) => `${k}: ${v}`).join("\n");

export const avisoTramite = (d: Tramite): Html => ({
  html: plantilla({
    preheader: `${d.tipo} de ${d.nombre}. La persona ya recibió la constancia.`,
    titulo: `${d.tipo}: ${d.nombre}`,
    cuerpo: `${talon(d.codigo, "La persona ya recibió por email la constancia con este código.")}${datos(filasTramite(d))}
      ${p(`Si corresponde un reintegro, hacelo por el mismo medio de pago (art. 34, Ley 24.240).`)}
      <div style="margin-top:8px">${boton(`mailto:${d.email}?subject=${encodeURIComponent(`Tu pedido ${d.codigo} - Matecito Tech`)}`, `Responder a ${d.nombre}`)}</div>`,
    pie: `Aviso automático del <a href="${SITE}/arrepentimiento/" style="color:${C.yerba}">botón de arrepentimiento y baja</a>.`,
  }),
  text: `${d.tipo}: ${d.nombre}\nCódigo: ${d.codigo}\n\n${textoTramite(d)}\n\nLa persona ya recibió la constancia por email.`,
});

export const constanciaTramite = (d: Tramite): Html => ({
  html: plantilla({
    preheader: `Constancia de tu pedido ${d.codigo}. Guardala.`,
    titulo: `Recibimos tu pedido de ${d.tipo.toLowerCase()}`,
    cuerpo: `${p(`Hola ${esc(d.nombre)}: esta es tu constancia, conforme a la Ley 24.240 y la Resolución SCI 424/2020. No tiene ningún costo.`)}${talon(d.codigo, "Guardá este código: identifica tu pedido.")}${datos(filasTramite(d))}
      ${p(`Si corresponde un reintegro, lo hacemos por el mismo medio de pago que usaste. Ante cualquier duda, respondé este correo citando el código.`)}`,
  }),
  text: `Recibimos tu pedido de ${d.tipo.toLowerCase()}.\n\nCódigo de identificación: ${d.codigo}\n\n${textoTramite(d)}\n\nEs tu constancia conforme a la Ley 24.240 y la Res. SCI 424/2020. No tiene costo.\n\n--\nMatecito Tech\n${SITE}`,
});
