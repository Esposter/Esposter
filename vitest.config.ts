import { getVitestConfiguration } from "@esposter/configuration";
import { defineConfig } from "vitest/config";

const base = getVitestConfiguration();

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    projects: [
      "packages/*",
      // The root `scripts/` suite is not a workspace package, so it needs its own project entry;
      // `extends: true` inherits this file's shared base (tsconfig paths, hook timeout).
      { extends: true, test: { include: ["scripts/**/*.test.ts"], name: "scripts" } },
    ],
  },
});
