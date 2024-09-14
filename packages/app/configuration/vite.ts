import type { NuxtConfig } from "nuxt/schema";

// @ts-expect-error We can ignore these configuration files as they will error at build time if they're wrong
import { commonjsDeps } from "@koumoul/vjsf/utils/build.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export const vite: NuxtConfig["vite"] = {
  build: {
    // Do not inline images and assets to avoid the phaser error
    // "Local data URIs are not supported"
    assetsInlineLimit: 0,
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
};
