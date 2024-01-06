import { type NuxtConfig } from "nuxt/schema";
// @ts-expect-error
export const modules: NuxtConfig["modules"] = [
  "@hebilicious/authjs-nuxt",
  "@nuxtjs/google-fonts",
  "@nuxt/test-utils/module",
  "@pinia/nuxt",
  "@unocss/nuxt",
  "@vite-pwa/nuxt",
  "@vueuse/nuxt",
  "vuetify-nuxt-module",
];
