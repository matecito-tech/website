# Seguridad

Si encontrás una vulnerabilidad en el sitio o en el servicio de formularios,
**no abras un issue público**. Escribinos a **matecito.tech@gmail.com** con el
asunto "Seguridad" y una descripción de cómo reproducirla.

- Respondemos dentro de las 72 horas hábiles.
- Te avisamos cuando esté corregida y, si querés, te mencionamos en el arreglo.

## Qué cubre

- El sitio estático de https://matecito.qzz.io (este repositorio).
- El Worker de formularios en `api/` (`matecito.qzz.io/api/*`).

## Medidas que ya aplicamos

- Content-Security-Policy con hashes, HSTS, `X-Frame-Options`, `Referrer-Policy`
  y `Permissions-Policy` (Cloudflare).
- Formularios con Turnstile, control de origen, campo trampa y rate limit.
- Secretos (contraseña de Gmail, clave de Turnstile) solo como secretos cifrados
  del Worker: nunca en el repositorio.
- Escaneo de secretos, protección de push, Dependabot y CodeQL en GitHub.
