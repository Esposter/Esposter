import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/rolldown";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      // @TODO: https://github.com/qmhc/unplugin-dts/issues/446
      entry: ["src/index.ts", "auto-imports.d.ts"],
      fileName: "index",
      formats: ["es"],
    },
    rolldownOptions: {
      // Vue-phaserjs
      external: ["phaser", "phaser3-rex-plugins", "pinia", "vue"],
    },
  },
  plugins: [
    AutoImport({ imports: ["pinia", "vue"] }),
    vue(),
    dts({ processor: "vue", tsconfigPath: "tsconfig.build.json" }),
    mkcert(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
