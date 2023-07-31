import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": "." },
  },
  test: {
    globalSetup: "test/globalSetup/environment.ts",
    setupFiles: "test/setupFiles/msw.ts",
    hookTimeout: 5 * 60 * 1000,
  },
});
