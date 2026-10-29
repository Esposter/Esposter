import type { UserConfig } from "tsdown";
import type { Options } from "unplugin-vue/api";

import { STYLESHEET_REQUEST_REGEX, VUE_AUTO_IMPORTS } from "#src/services/constants";
import { getTsdownConfiguration } from "#src/services/getTsdownConfiguration";
import { readPackageManifest } from "#src/services/readPackageManifest";
import { vueStyleSrcPlugin } from "#src/services/vueStyleSrcPlugin";
import { mergeConfig } from "tsdown";
import AutoImport from "unplugin-auto-import/rolldown";
import Vue from "unplugin-vue/rolldown";

// The packages that ship `.vue` files build through tsdown like every other: `unplugin-vue` compiles the components and
// `dts.tsc.vue` hands declaration generation to vue-tsc. `vueOptions` reaches the compiler, for a package whose templates
// Hold elements a renderer rather than Vue resolves, such as TresJS's `TresMesh`. Reaching rolldown through vite would
// Do the same two jobs behind a second build path, free to drift from this one.
//
// `eager` is what makes auto-imports typeable. The declaration build seeds its TypeScript program from the
// Entrypoints alone, and `auto-imports.d.ts` is an ambient file no entrypoint imports — so without this,
// `defineStore` and friends are unresolved and every store's declaration collapses to `any` in the shipped
// `.d.ts`, silently, while `vue-tsc` still passes. `eager` loads every file the tsconfig lists instead, which
// Is how the tsconfig's own `include` picks the ambient file up. That is why this build alone names a tsconfig: the
// Package's `tsconfig.build.json` adds `tsconfig.build.base.json`'s excludes, so the tests stay out of the program —
// The declarations come out the same either way, and the build takes a good deal longer with them in.
// A private package keeps the base's `dts: false`, for the reason the base gives: nothing types against its `dist`.
export const getTsdownConfigurationVue = (vueOptions: Options = {}): UserConfig =>
  mergeConfig(getTsdownConfiguration({ exportsGeneration: "vue" }), {
    ...(readPackageManifest().private
      ? {}
      : { dts: { tsc: { eager: true, vue: true }, tsconfig: "tsconfig.build.json" } }),
    // A stylesheet is compiled into this package's own CSS, a sibling package's that a style block's `src` names
    // Included. Left external, the built JS would import a `.css` file that Node cannot load in a script
    deps: { alwaysBundle: [STYLESHEET_REQUEST_REGEX] },
    plugins: [
      // @TODO: no upstream issue — a <style src> still builds only through this plugin on unplugin-vue 8.0.1, whose fix for #201 resolves the stylesheet's path but leaves its id a .css request with a query, which tsdown rejects as "Bundling CSS is no longer supported" — drop this plugin once a <style src> builds without it
      vueStyleSrcPlugin,
      AutoImport({ imports: [...VUE_AUTO_IMPORTS] }),
      Vue({ ...vueOptions, isProduction: true }),
    ],
  });
