import type { NuxtConfig } from "nuxt/schema";

export const vuetify: NuxtConfig["vuetify"] = {
  moduleOptions: {
    enableRules: true,
    prefixComposables: true,
    rulesConfiguration: {
      configFile: "@/rules.config.ts",
    },
    styles: {
      configFile: "@/assets/css/settings.scss",
    },
  },
};
