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
  // @TODO: no upstream issue — a <style src> still builds only through this plugin on unplugin-vue 8.0.1, whose fix for #201 resolves the stylesheet's path but leaves its id a .css request with a query, which tsdown rejects as "Bundling CSS is no longer supported" — drop this plugin once a <style src> builds without it
  { ...vueStyleSrcPlugin, enforce: "pre" },
  AutoImport({ imports: [...VUE_AUTO_IMPORTS] }),
  Vue(vueOptions),
];
