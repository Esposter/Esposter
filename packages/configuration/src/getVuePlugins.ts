import type { PluginOption } from "vite";

import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";

// The SFC pipeline a `.vue` package needs in both of its Vite runs — the library build and its Vitest config —
// So the two can never drift into compiling components differently from how the tests mount them.
export const getVuePlugins = (): PluginOption[] => [AutoImport({ imports: ["pinia", "vue"] }), vue()];
