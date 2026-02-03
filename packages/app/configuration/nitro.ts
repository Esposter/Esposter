import type { NitroConfig } from "nitropack/types";
// @TODO: https://github.com/nuxt/nuxt/issues/33664
export const nitro: NitroConfig = {
  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: true,
      },
    },
  },
};
