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
    rolldownOptions: {
      // @vue-pdf-viewer/viewer imports `renderTextLayer` from pdfjs-dist as a fallback
      // for older pdfjs versions; pdfjs-dist 5.x uses the `TextLayer` class instead,
      // so this import is intentionally dead code and the warning is harmless.
      onwarn: (warning, warn) => {
        if (warning.code === "IMPORT_IS_UNDEFINED" && warning.message.includes("renderTextLayer")) return;
        warn(warning);
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "@/assets/css/classes.scss" as *;
        @use "@/assets/css/components.scss" as *;
        @use "@/assets/css/variables.scss" as *;
        `,
      },
    },
  },
  optimizeDeps: {
    // https://github.com/vue-pdf-viewer/starter-vpv-nuxt-ts/blob/main/nuxt.config.ts
    exclude: ["@vue-pdf-viewer/viewer"],
    include: [...commonjsDeps, "pdfjs-dist", "debug"],
  },
  plugins: [fixAjv],
};
