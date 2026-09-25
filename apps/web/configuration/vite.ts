import type { NuxtConfig } from "nuxt/schema";

import { fixAjv } from "./plugins/fixAjv";

export const vite: NuxtConfig["vite"] = {
  build: {
    // Fix phaser "Local data URIs are not supported"
    // https://www.andrewzigler.com/blog/using-phaser-3-with-nuxt
    assetsInlineLimit: 0,
  },
  mode: process.env.APP_ENV,
  optimizeDeps: {
    exclude: [
      // https://github.com/vue-pdf-viewer/starter-vpv-nuxt-ts/blob/main/nuxt.config.ts
      "@vue-pdf-viewer/viewer",
      // Three's inspector loads extension assets relative to import.meta.url, which breaks from Vite's cache.
      "three/examples/jsm/inspector/Inspector.js",
    ],
    // Mermaid is imported lazily after mount, so without this it is discovered mid-session and the
    // Re-optimize rewrites the chunks it shares with the app out from under the loaded module graph. JSON Forms'
    // Ajv is CommonJS the schema forms only load in a dialog, so it is named through its importer, whose own copy it is
    include: ["@jsonforms/core > ajv", "@jsonforms/core > ajv-formats", "fast-deep-equal", "mermaid", "pdfjs-dist"],
  },
  plugins: [fixAjv],
};
