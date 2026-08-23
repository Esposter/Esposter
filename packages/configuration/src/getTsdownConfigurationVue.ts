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
// Merged rather than spread: `dts` is the base's, plus `vue`. Spreading would replace the whole object and
// Force this file to restate which tsconfig the declarations build against.
export const getTsdownConfigurationVue = (): UserConfig =>
  mergeConfig(getTsdownConfiguration(), {
    dts: { vue: true },
    plugins: [AutoImport({ imports: [...VUE_AUTO_IMPORTS] }), Vue({ isProduction: true })],
  });
