import type { UserConfig } from "tsdown";

import { VUE_AUTO_IMPORTS } from "#src/constants";
import { getTsdownConfiguration } from "#src/getTsdownConfiguration";
import { mergeConfig } from "tsdown";
import AutoImport from "unplugin-auto-import/rolldown";
import Vue from "unplugin-vue/rolldown";

// The one package that ships `.vue` files, and it builds through tsdown like every other: `unplugin-vue`
// Compiles the components and `dts.vue` hands declaration generation to vue-tsc. Reaching rolldown through
// Vite would do the same two jobs behind a second build path, free to drift from this one.
//
// `eager` is what makes auto-imports typeable. The declaration build seeds its TypeScript program from the
// Entrypoints alone, and `auto-imports.d.ts` is an ambient file no entrypoint imports — so without this,
// `defineStore` and friends are unresolved and every store's declaration collapses to `any` in the shipped
// `.d.ts`, silently, while `vue-tsc` still passes. `eager` loads every file the tsconfig lists instead, which
// Is how the tsconfig's own `include` picks the ambient file up. That is why this build alone names a tsconfig: the
// Package's `tsconfig.build.json` adds `tsconfig.build.base.json`'s excludes, so the tests stay out of the program —
// The declarations come out the same either way, and the build takes a good deal longer with them in.
export const getTsdownConfigurationVue = (): UserConfig =>
  mergeConfig(getTsdownConfiguration({ exportsGeneration: "vue" }), {
    dts: { eager: true, tsconfig: "tsconfig.build.json", vue: true },
    plugins: [AutoImport({ imports: [...VUE_AUTO_IMPORTS] }), Vue({ isProduction: true })],
  });
