import type { NuxtConfig } from "nuxt/schema";

import { commonjsDeps } from "@koumoul/vjsf/utils/build.js";

export const vite: NuxtConfig["vite"] = {
  build: {
    // Do not inline images and assets to avoid the phaser error
    // "Local data URIs are not supported"
    assetsInlineLimit: 0,
    commonjsOptions: {
      transformMixedEsModules: true,
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
    include: commonjsDeps,
  },
};
