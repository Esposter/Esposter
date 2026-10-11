import type { NuxtConfig } from "nuxt/schema";

export const build: NuxtConfig["build"] = {
  // Read by the dependency score's bundle column, which `nuxt analyze` writes; a normal build leaves it disabled
  analyze: { filename: ".nuxt/analyze/{name}.json", template: "raw-data" },
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
