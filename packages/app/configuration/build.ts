import type { NuxtConfig } from "nuxt/schema";

export const build: NuxtConfig["build"] = {
  transpile: ["@vuepic/vue-datepicker", "pluralize", "survey-creator-vue", "trpc-nuxt"],
};
