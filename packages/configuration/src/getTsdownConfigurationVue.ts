import type { UserConfig } from "tsdown";

import { mergeConfig } from "tsdown";
import AutoImport from "unplugin-auto-import/rolldown";
import Vue from "unplugin-vue/rolldown";

import { VUE_AUTO_IMPORTS } from "./constants";
import { getTsdownConfiguration } from "./getTsdownConfiguration";
// The one package that ships `.vue` files. It used to reach rolldown through Vite purely for SFC compilation
// And a vue-tsc declaration build; tsdown does both directly — `unplugin-vue` compiles the components and
// `dts.vue` hands declaration generation to vue-tsc — so there is one build path in this repo again rather
// Than a rolldown one and a Vite one that could drift.
//
// Merged rather than spread: `dts` is the base's, plus `vue` and `eager`. Spreading would replace the whole
// Object and force this file to restate which tsconfig the declarations build against.
//
// `eager` is what makes auto-imports typeable. The declaration build seeds its TypeScript program from the
// Entrypoints alone, and `auto-imports.d.ts` is an ambient file no entrypoint imports — so without this,
// `defineStore` and friends are unresolved and every store's declaration collapses to `any` in the shipped
// `.d.ts`, silently, while `vue-tsc` still passes. `eager` loads every file the tsconfig lists instead, which
// Is how the tsconfig's own `include` picks the ambient file up.
export const getTsdownConfigurationVue = (): UserConfig =>
  mergeConfig(getTsdownConfiguration(), {
    dts: { eager: true, vue: true },
    plugins: [AutoImport({ imports: [...VUE_AUTO_IMPORTS] }), Vue({ isProduction: true })],
  });
