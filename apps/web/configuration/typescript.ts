import type { NuxtConfig } from "nuxt/schema";

// Nuxt generates four standalone tsconfigs and none of them extends `tsconfig.base.json`, so the workspace's
// `source` condition has to be restated on each. Without it the app is the one consumer left resolving every
// Sibling package through the `default` arm — its `dist` — which is what forces every private package to emit
// Declarations nothing else reads. The server config is Nitro's and is extended in `configuration/nitro.ts`.
const compilerOptions = { customConditions: ["source"] };

export const typescript: NuxtConfig["typescript"] = {
  nodeTsConfig: { compilerOptions },
  sharedTsConfig: { compilerOptions },
  tsConfig: { compilerOptions },
};
