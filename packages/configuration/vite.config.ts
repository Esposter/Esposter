import type { UserConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/rolldown";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import mkcert from "vite-plugin-mkcert";
import tsconfigPaths from "vite-tsconfig-paths";

const viteConfiguration: UserConfig = defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"],
    },
    rolldownOptions: {
      // vue-phaserjs
      external: ["phaser", "phaser3-rex-plugins", "pinia", "vue"],
    },
  },
  plugins: [
    AutoImport({ imports: ["pinia", "vue"] }),
    tsconfigPaths(),
    vue(),
    // @TODO: https://github.com/qmhc/unplugin-dts/issues/302
    dts({ tsconfigPath: "tsconfig.build.json" }),
    mkcert(),
  ],
});

export default viteConfiguration;
