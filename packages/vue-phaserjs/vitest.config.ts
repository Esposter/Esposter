import { getVitestConfiguration } from "@esposter/configuration";
import vue from "@vitejs/plugin-vue";
import { join } from "node:path";
import AutoImport from "unplugin-auto-import/vite";
import { mergeConfig } from "vitest/config";

export default mergeConfig(getVitestConfiguration(), {
  plugins: [AutoImport({ imports: ["pinia", "vue"] }), vue()],
  resolve: {
    alias: {
      // Use the pre-built ESM bundle so phaser3spectorjs (a WebGL inspector referenced
      // At init time in the source entry) is not required during tests.
      // Absolute path bypasses Vite 8 strict package exports field check.
      phaser: join(import.meta.dirname, "node_modules/phaser/dist/phaser.esm.js"),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setupCanvas.ts", "./src/test/setup.ts"],
  },
});
