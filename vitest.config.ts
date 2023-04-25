import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": "." },
  },
  test: {
    globalSetup: "test/globalSetup/mock/environment.ts",
    setupFiles: "test/setupFiles/mock/trpc.ts",
  },
});
