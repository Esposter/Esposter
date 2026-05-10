import type { NuxtConfig } from "nuxt/schema";

export const vuetify: NuxtConfig["vuetify"] = {
  moduleOptions: {
    disableVuetifyStyles: true,
    prefixComposables: true,
    styles: {
      configFile: "@/assets/css/settings.scss",
    },
  },
};
