import type { NitroConfig } from "nitropack/types";

export const nitro: NitroConfig = {
  // Nitro's own esbuild default is es2019, which predates the bigint literals the RBAC permission bitfield uses
  esbuild: { options: { target: "esnext" } },
  experimental: { websocket: true },
  typescript: {
    tsConfig: {
      compilerOptions: {
        customConditions: ["source"],
        // Nuxt sets it on the app and node projects but not the server's, so type-only imports keep one rule
        // Everywhere
        verbatimModuleSyntax: true,
      },
    },
  },
};
