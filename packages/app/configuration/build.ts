import type { NuxtConfig } from "nuxt/schema";

export const build: NuxtConfig["build"] = {
  transpile: [
    "@vuepic/vue-datepicker",
    "pluralize",
    "survey-creator-vue",
    // https://github.com/vue-pdf-viewer/starter-vpv-nuxt-ts/blob/main/nuxt.config.ts
    ({ isServer }) => (isServer ? "@vue-pdf-viewer/viewer" : false),
    ({ isServer }) => (isServer ? "pdfjs-dist" : false),
  ],
};
