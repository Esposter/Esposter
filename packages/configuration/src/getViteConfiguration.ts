import type { UserConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/rolldown";
import dts from "unplugin-dts/vite";
import mkcert from "vite-plugin-mkcert";

import { external } from "./external/external";

export const getViteConfiguration = (): UserConfig => ({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"],
    },
    rolldownOptions: {
      external,
    },
  },
  plugins: [AutoImport({ imports: ["pinia", "vue"] }), vue(), dts({ tsconfigPath: "tsconfig.build.json" }), mkcert()],
  resolve: {
    tsconfigPaths: true,
  },
});
