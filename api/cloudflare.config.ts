import { bindings, defineConfig, triggers } from "cf/config";

// Worker que recibe los formularios del sitio y los envía por mail
// (Email Routing). Vive en matecito.qzz.io/api/* : el resto lo sirve GitHub Pages.
export default defineConfig({
  accountId: "11001939a9fd02252e2caf9784626b9e",
  worker: {
    name: "matecito-formularios",
    entrypoint: "./src/index.ts",
    compatibilityDate: "2026-10-01",
    env: {
      MAIL: bindings.sendEmail({ destinationAddress: "matecito.tech@gmail.com" }),
    },
    triggers: [triggers.fetch({ pattern: "matecito.qzz.io/api/*", zone: "matecito.qzz.io" })],
  },
});
