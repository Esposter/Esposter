import { type NuxtConfig } from "nuxt/schema";

export const vite: NuxtConfig["vite"] = {
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
