import type { NuxtConfig } from "nuxt/schema";

export const vuetify: NuxtConfig["vuetify"] = {
  moduleOptions: {
    styles: {
      configFile: "@/assets/css/components.scss",
    },
  },
};
