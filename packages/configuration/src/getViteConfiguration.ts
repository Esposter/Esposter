import type { UserConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/rolldown";
import dts from "unplugin-dts/vite";
import mkcert from "vite-plugin-mkcert";

import { external } from "./external/external";

export const getViteConfiguration = (): UserConfig => ({
  build: {
    lib: {
      // @TODO: https://github.com/qmhc/unplugin-dts/issues/446
      entry: ["src/index.ts", "auto-imports.d.ts"],
      fileName: "index",
      formats: ["es"],
    },
    rolldownOptions: {
      external,
    },
  },
  plugins: [
    AutoImport({ imports: ["pinia", "vue"] }),
    vue(),
    // @TODO: Can remove after upgrade https://github.com/qmhc/unplugin-dts/commit/802d24346bb2d7e67f173ff7000d4955b7f30a7d
    dts({ processor: "vue", tsconfigPath: "tsconfig.build.json" }),
    mkcert(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
