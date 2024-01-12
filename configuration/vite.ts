import { type NuxtConfig } from "nuxt/schema";

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
        @import "vuetify/settings";
        @import "@/assets/styles/classes.scss";
        @import "@/assets/styles/variables.scss";
        `,
      },
    },
  },
  // @TODO: Remove this in vue 3.5
  vue: {
    script: {
      propsDestructure: true,
    },
  },
};
