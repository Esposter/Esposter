import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      // vue-phaserjs
      external: ["vue", "phaser", "phaser3-rex-plugins", "pinia"],
    },
  },
  plugins: [
    AutoImport({ dts: true, imports: ["vue", "pinia"] }),
    tsconfigPaths(),
    vue(),
    // @TODO: https://github.com/qmhc/vite-plugin-dts/issues/302
    dts({ tsconfigPath: "tsconfig.build.json" }),
    mkcert(),
  ],
});
