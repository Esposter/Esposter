import type { NuxtConfig } from "nuxt/schema";

import { commonjsDeps } from "@koumoul/vjsf/utils/build.js";

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
    // Re-optimize rewrites the dayjs chunk it shares with the app out from under the loaded module graph
    include: [...commonjsDeps, "debug", "mermaid", "pdfjs-dist"],
  },
  plugins: [fixAjv],
};
