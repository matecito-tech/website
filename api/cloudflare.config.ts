import { bindings, defineConfig, triggers } from "cf/config";

// Worker que recibe los formularios del sitio y los envía por mail
// (Gmail por SMTP). Vive en matecito.qzz.io/api/* : el resto lo sirve GitHub Pages.
export default defineConfig({
  accountId: "11001939a9fd02252e2caf9784626b9e",
  worker: {
    name: "matecito-formularios",
    entrypoint: "./src/index.ts",
    compatibilityDate: "2026-10-01",
    env: {
      // Contraseña de aplicación de Gmail (secreto: se carga con `cf workers secrets update`)
      GMAIL_APP_PASSWORD: bindings.secret(),
      // Clave secreta del widget de Turnstile (anti-bots)
      TURNSTILE_SECRET: bindings.secret(),
    },
    triggers: [triggers.fetch({ pattern: "matecito.qzz.io/api/*", zone: "matecito.qzz.io" })],
  },
});
