import type { PluginOption } from "vite";

import { VUE_AUTO_IMPORTS } from "#src/constants";
import AutoImport from "unplugin-auto-import/vite";
import Vue from "unplugin-vue/vite";

// The SFC pipeline a `.vue` package needs in its Vitest run. It is the same pair `getTsdownConfigurationVue`
// Gives the build, through each plugin's Vite entry rather than its rolldown one, so the tests can never
// Compile a component differently from how the build ships it.
export const getVuePlugins = (): PluginOption[] => [AutoImport({ imports: [...VUE_AUTO_IMPORTS] }), Vue()];
