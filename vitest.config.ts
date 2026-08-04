import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { defineConfig } from "vitest/config";

const baseVitestConfiguration = getVitestConfiguration();
const vitestConfiguration: ViteUserConfig = defineConfig({
  ...baseVitestConfiguration,
  test: {
    ...baseVitestConfiguration.test,
    projects: [
      "packages/*",
      // The root `scripts/` suite is not a workspace package, so it needs its own project entry;
      // `extends: true` inherits this file's shared base (tsconfig paths, hook timeout). Scope both the
      // Test and benchmark globs to `scripts/` — `benchmark.include` defaults to `**/*.bench.ts`, which
      // Would otherwise pull every package's bench file into this project on `vitest bench --project scripts`.
      {
        extends: true,
        test: {
          benchmark: { include: ["scripts/**/*.bench.ts"] },
          include: ["scripts/**/*.test.ts"],
          name: "scripts",
        },
      },
      // The workflow scripts under `.claude/` are not a workspace package either. They cannot be imported or
      // Split into modules — they are async function bodies the harness injects globals into — so their tests
      // Load the real file and drive it with stubbed agents, which is the only way to pin the decisions a review
      // Makes without spawning one.
      {
        extends: true,
        test: {
          include: [".claude/**/*.test.ts"],
          name: "claude",
        },
      },
    ],
  },
});

export default vitestConfiguration;
