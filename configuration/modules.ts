import { type NuxtConfig } from "nuxt/schema";

export const modules: NuxtConfig["modules"] = [
  "@hebilicious/authjs-nuxt",
  "@nuxt/test-utils/module",
  "@pinia/nuxt",
  "@unocss/nuxt",
  "@vite-pwa/nuxt",
  "@vueuse/nuxt",
  "unplugin-fonts/nuxt",
  "vuetify-nuxt-module",
];
