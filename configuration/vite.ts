import type { NuxtConfig } from "nuxt/schema";

export const vite: NuxtConfig["vite"] = {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @import "vuetify/settings";
        @import "@/assets/styles/variables.scss";
        `,
      },
    },
  },
  // @TODO: Remove this in vue 3.4
  vue: {
    script: {
      defineModel: true,
      propsDestructure: true,
    },
  },
};
