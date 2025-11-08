import type { NuxtConfig } from "nuxt/schema";
// @TODO: https://github.com/nuxt/nuxt/issues/33664
export const nitro: NuxtConfig["nitro"] = {
  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: true,
      },
    },
  },
};
