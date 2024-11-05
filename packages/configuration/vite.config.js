import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import mkcert from "vite-plugin-mkcert";
import { nodePolyfills } from "vite-plugin-node-polyfills";
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
      external: ["vue", "pinia"],
    },
  },
  plugins: [
    AutoImport({ imports: ["vue", "pinia"], dts: true }),
    tsconfigPaths(),
    nodePolyfills({ include: ["zlib"] }),
    vue(),
    dts(),
    mkcert(),
  ],
});
