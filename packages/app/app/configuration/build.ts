import type { NuxtConfig } from "nuxt/schema";

export const build: NuxtConfig["build"] = {
  transpile: [
    "@vuepic/vue-datepicker",
    "pluralize",
    "survey-creator-vue",
    "trpc-nuxt",
    ({ isServer }) => (isServer ? "@vue-pdf-viewer/viewer" : false),
    ({ isServer }) => (isServer ? "pdfjs-dist" : false),
  ],
};
