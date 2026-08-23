import type { NitroConfig } from "nitropack/types";

import { resolve } from "node:path";

// Nuxt always runs with this package as cwd, so the workspace root is one level up.
const WORKSPACE_DIRECTORY = resolve("..").replaceAll("\\", "/");
// Every workspace package is bundled into the server rather than left as an import for Node to resolve. They
// Export TypeScript source to their workspace consumers (`exports.devExports`, so no rebuild stands between
// Editing one and this app seeing it), and Nitro's prerender step imports the server output through Node's own
// ESM loader, which resolves no extensionless specifier and strips no enum. Inlining means that loader never
// Sees a workspace package at all — and a serverless artifact wants its own code inlined regardless.
//
// A function rather than the package names it stands for. Nitro scores every matcher and lets the highest score
// Decide, and its own `external` list holds the absolute `node_modules` directories — which outscore a RegExp
// (scored by its source length) and tie unpredictably with an absolute path. Only a function is scored above
// Both. Matching the directory also needs no list to maintain: a package added under `packages/` is covered by
// The same rule, and nothing has to remember to name it here.
const getIsWorkspaceModule = (id: string): boolean => id.replaceAll("\\", "/").startsWith(WORKSPACE_DIRECTORY);
// @TODO: https://github.com/nuxt/nuxt/issues/33664
export const nitro: NitroConfig = {
  experimental: {
    websocket: true,
  },
  externals: {
    inline: [getIsWorkspaceModule],
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: true,
      },
    },
  },
};
