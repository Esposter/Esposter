import type { NuxtConfig } from "nuxt/schema";

export const build: NuxtConfig["build"] = {
  transpile: [
    // Declares "type": "module" over a UMD main, so node's own import of it finds no default export
    "@panzoom/panzoom",
    "@vuetify/v0",
    "survey-creator-vue",
    // https://github.com/vue-pdf-viewer/starter-vpv-nuxt-ts/blob/main/nuxt.config.ts
    ({ isServer }) => (isServer ? "@vue-pdf-viewer/viewer" : false),
    ({ isServer }) => (isServer ? "pdfjs-dist" : false),
  ],
};
