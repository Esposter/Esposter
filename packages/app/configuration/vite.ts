import type { NuxtConfig } from "nuxt/schema";

import { commonjsDeps } from "@koumoul/vjsf/utils/build.js";

export const vite: NuxtConfig["vite"] = {
  build: {
    // Fix phaser "Local data URIs are not supported"
    assetsInlineLimit: 0,
    // https://koumoul-dev.github.io/vuetify-jsonschema-form/latest/getting-started
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      preserveEntrySignatures: "strict",
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
    include: [...commonjsDeps, "pdfjs-dist"],
  },
};
