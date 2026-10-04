import type { NuxtConfig } from "nuxt/schema";

// Nuxt generates four standalone tsconfigs and none of them extends `tsconfig.base.json`, so the workspace's
// `source` condition is restated here, where Nuxt carries `tsConfig`'s compiler options into all four. Without it
// The app is the one consumer left resolving every sibling package through the `default` arm — its `dist` — which
// Is what forces every private package to emit declarations nothing else reads. The condition is spelled rather
// Than imported as `SOURCE_CONDITION`: `nuxt prepare` loads this from `postinstall`, before
// `@esposter/configuration` is built, so `typescript.test.ts` holds the spelling to it instead.
export const typescript: NuxtConfig["typescript"] = { tsConfig: { compilerOptions: { customConditions: ["source"] } } };
