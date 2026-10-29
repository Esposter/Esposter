import type { Options } from "unplugin-vue/api";
import type { PluginOption } from "vite";

import { VUE_AUTO_IMPORTS } from "#src/services/constants";
import { vueStyleSrcPlugin } from "#src/services/vueStyleSrcPlugin";
import AutoImport from "unplugin-auto-import/vite";
import Vue from "unplugin-vue/vite";

// The SFC pipeline a `.vue` package needs in its Vitest run.
// It is the same set of plugins `getTsdownConfigurationVue` gives the build, through each plugin's Vite entry, because
// Vite's config and dev-server hooks exist only on that entry.
// Both pass the same `vueOptions` to the compiler. A package whose templates hold a renderer's own elements, such as
// `TresMesh`, depends on that. The build always compiles for production, but a test run takes `isProduction` from
// Vite's mode, so a test compile is not a production one.
export const getVuePlugins = (vueOptions: Options = {}): PluginOption[] => [
  // @TODO: https://github.com/unplugin/unplugin-vue/issues/201
  { ...vueStyleSrcPlugin, enforce: "pre" },
  AutoImport({ imports: [...VUE_AUTO_IMPORTS] }),
  Vue(vueOptions),
];
