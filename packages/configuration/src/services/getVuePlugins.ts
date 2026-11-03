import type { VizeOptions } from "@vizejs/vite-plugin";
import type { PluginOption } from "vite";

import { VUE_AUTO_IMPORTS } from "#src/services/constants";
import { vize } from "@vizejs/vite-plugin";
import AutoImport from "unplugin-auto-import/vite";

// The SFC pipeline a `.vue` package needs in its Vitest run.
// It is the same set of plugins `getTsdownConfigurationVue` gives the build, through each plugin's Vite entry, because
// Vite's config and dev-server hooks exist only on that entry.
// Both pass the same `vizeOptions` to the compiler. A package whose templates hold a renderer's own elements, such as
// `TresMesh`, depends on that. The build always compiles for production, but a test run takes `isProduction` from
// Vite's mode, so a test compile is not a production one.
export const getVuePlugins = (vizeOptions: VizeOptions = {}): PluginOption[] => [
  AutoImport({ imports: [...VUE_AUTO_IMPORTS] }),
  vize(vizeOptions),
];
