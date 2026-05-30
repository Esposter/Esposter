import type { NitroConfig } from "nitro/types";
// @TODO: https://github.com/nuxt/nuxt/issues/33664
export const nitro: NitroConfig = {
  experimental: {
    websocket: true,
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: true,
      },
    },
  },
};
