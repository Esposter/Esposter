import type { NuxtConfig } from "nuxt/schema";

export const vuetify: NuxtConfig["vuetify"] = {
  moduleOptions: {
    prefixComposables: true,
    styles: {
      colors: false,
      utilities: false,
    },
  },
};
