import type { NuxtConfig } from "nuxt/schema";

export const modules: NuxtConfig["modules"] = [
  "@hebilicious/authjs-nuxt",
  "@nuxt/eslint",
  "@nuxt/fonts",
  "@nuxt/test-utils/module",
  "@pinia/nuxt",
  "@unocss/nuxt",
  "@vite-pwa/nuxt",
  "@vueuse/nuxt",
  "nuxt-security",
  "vuetify-nuxt-module",
];
