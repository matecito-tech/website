// Cliente SMTP mínimo sobre sockets TCP de Workers (TLS implícito, puerto 465).
// Se usa con Gmail y una contraseña de aplicación: los mails salen desde la
// propia cuenta, así que Gmail los firma y llegan a la bandeja de entrada.
import { connect } from "cloudflare:sockets";

export interface Mail {
  from: string; // dirección (debe ser la cuenta autenticada)
  fromName: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
}

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (s: string) => btoa(String.fromCharCode(...enc.encode(s)));

const lineas = (s: string) => b64(s).replace(/.{1,76}/g, "$&\r\n");

const mensaje = (m: Mail) => {
  const cabeceras = [
    `From: =?UTF-8?B?${b64(m.fromName)}?= <${m.from}>`,
    `To: <${m.to}>`,
    m.replyTo ? `Reply-To: <${m.replyTo}>` : "",
    `Subject: =?UTF-8?B?${b64(m.subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@matecito.qzz.io>`,
    "MIME-Version: 1.0",
  ].filter(Boolean);
  if (!m.html) {
    return [...cabeceras, 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64"].join("\r\n") + `\r\n\r\n${lineas(m.text)}`;
  }
  // HTML con alternativa en texto plano (lectores que no muestran HTML)
  const limite = `=_${crypto.randomUUID()}`;
  const parte = (tipo: string, cuerpo: string) =>
    `--${limite}\r\nContent-Type: ${tipo}; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n${lineas(cuerpo)}`;
  return [...cabeceras, `Content-Type: multipart/alternative; boundary="${limite}"`].join("\r\n") +
    `\r\n\r\n${parte("text/plain", m.text)}\r\n${parte("text/html", m.html)}\r\n--${limite}--`;
};

export async function enviarSmtp(user: string, pass: string, mails: Mail[]): Promise<void> {
  const socket = connect({ hostname: "smtp.gmail.com", port: 465 }, { secureTransport: "on" });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  let buffer = "";

  // Lee una respuesta completa (las multilínea usan "250-..." hasta "250 ...")
  const leer = async (): Promise<{ code: number; text: string }> => {
    for (;;) {
      const lineas = buffer.split("\r\n");
      for (let i = 0; i < lineas.length - 1; i++) {
        if (/^\d{3} /.test(lineas[i])) {
          const text = lineas.slice(0, i + 1).join("\n");
          buffer = lineas.slice(i + 1).join("\r\n");
          return { code: Number(lineas[i].slice(0, 3)), text };
        }
      }
      const { value, done } = await reader.read();
      if (done) throw new Error(`SMTP cerró la conexión: ${buffer}`);
      buffer += dec.decode(value, { stream: true });
    }
  };
  const cmd = async (linea: string, esperado: number) => {
    await writer.write(enc.encode(`${linea}\r\n`));
    const r = await leer();
    if (r.code !== esperado) throw new Error(`SMTP ${linea.split(" ")[0]}: ${r.text}`);
    return r;
  };

  try {
    const saludo = await leer();
    if (saludo.code !== 220) throw new Error(`SMTP saludo: ${saludo.text}`);
    await cmd("EHLO matecito.qzz.io", 250);
    await cmd(`AUTH PLAIN ${b64(`\0${user}\0${pass}`)}`, 235);
    for (const m of mails) {
      await cmd(`MAIL FROM:<${m.from}>`, 250);
      await cmd(`RCPT TO:<${m.to}>`, 250);
      await cmd("DATA", 354);
      // Dot-stuffing: una línea que empieza con "." se duplica
      const data = mensaje(m).replace(/\r\n\./g, "\r\n..");
      await cmd(`${data}\r\n.`, 250);
    }
    await writer.write(enc.encode("QUIT\r\n"));
  } finally {
    await socket.close().catch(() => {});
  }
}
