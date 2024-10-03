import type { NuxtConfig } from "nuxt/schema";

import { commonjsDeps } from "@koumoul/vjsf/utils/build.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";

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
        @use "vuetify/settings" as *;
        @use "@/assets/styles/classes.scss" as *;
        @use "@/assets/styles/variables.scss" as *;
        `,
      },
    },
  },
  optimizeDeps: {
    include: commonjsDeps,
  },
  // Required for parse-tmx
  plugins: [nodePolyfills({ include: ["zlib"] })],
  // @TODO: Remove this in vue 3.5
  vue: {
    script: {
      propsDestructure: true,
    },
  },
};
