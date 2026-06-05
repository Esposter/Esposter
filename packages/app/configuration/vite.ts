import type { NuxtConfig } from "nuxt/schema";

import { commonjsDeps } from "@koumoul/vjsf/utils/build.js";

import { fixAjv } from "./plugins/fixAjv";

export const vite: NuxtConfig["vite"] = {
  build: {
    // Fix phaser "Local data URIs are not supported"
    // https://www.andrewzigler.com/blog/using-phaser-3-with-nuxt
    assetsInlineLimit: 0,
    // https://koumoul-dev.github.io/vuetify-jsonschema-form/latest/getting-started
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    exclude: [
      // https://github.com/vue-pdf-viewer/starter-vpv-nuxt-ts/blob/main/nuxt.config.ts
      "@vue-pdf-viewer/viewer",
      // Three's inspector loads extension assets relative to import.meta.url, which breaks from Vite's cache.
      "three/examples/jsm/inspector/Inspector.js",
    ],
    include: [...commonjsDeps, "debug", "pdfjs-dist"],
  },
  plugins: [fixAjv],
};
