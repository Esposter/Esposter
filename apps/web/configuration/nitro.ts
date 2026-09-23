import type { NitroConfig } from "nitropack/types";
// @TODO: https://github.com/nuxt/nuxt/issues/33664
export const nitro: NitroConfig = {
  // Nitro's own esbuild default is es2019, which predates the bigint literals the RBAC permission bitfield uses
  esbuild: { options: { target: "esnext" } },
  experimental: { websocket: true },
  typescript: {
    tsConfig: {
      compilerOptions: {
        customConditions: ["source"],
        verbatimModuleSyntax: true,
      },
    },
  },
};
