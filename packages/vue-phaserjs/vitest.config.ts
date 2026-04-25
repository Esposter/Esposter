import baseConfig from "@esposter/configuration/vitest.config";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { mergeConfig } from "vitest/config";

export default mergeConfig(baseConfig, {
  plugins: [AutoImport({ imports: ["pinia", "vue"] }), vue()],
  resolve: {
    alias: {
      // Use the pre-built ESM bundle so phaser3spectorjs (a WebGL inspector referenced
      // At init time in the source entry) is not required during tests
      phaser: "phaser/dist/phaser.esm.js",
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setupCanvas.ts", "./src/test/setup.ts"],
  },
});
