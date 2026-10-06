import type { UserConfig } from "vite-plus";

import { defineConfig } from "vite-plus";

// The state pnpm writes on every install and every run, which no build's result depends on: the dependencies
// Themselves are traced file by file
const PNPM_STATE_PATTERNS = [
  "!**/node_modules/.pnpm-task-run-state-v1/**",
  "!node_modules/.pnpm-workspace-state-v1.json",
];

// Each task keeps the files its command rewrites out of its inputs, without which `vp` refuses to cache it.
// Those files stay outputs, so a hit restores them.
const createTask = (
  command: string,
  rewrittenPatterns: string[],
  output: (string | { auto: true })[] = [{ auto: true }, ...PNPM_STATE_PATTERNS],
) => ({
  cache: {
    input: [{ auto: true }, ...PNPM_STATE_PATTERNS, ...rewrittenPatterns.map((pattern) => `!${pattern}`)],
    output,
  },
  command,
});

// Read by `vp run` alone, and configures no bundler: the app builds through `nuxt build` from apps/web/nuxt.config.ts.
const configuration: UserConfig = defineConfig({
  run: {
    tasks: {
      // Nothing reads the app's `.output`, so a hit restores nothing: the replay itself is the verdict that this
      // Exact tree already built green
      "build:app": createTask(
        "pnpm -C apps/web build",
        ["apps/web/.data/**", "apps/web/.nuxt/**", "apps/web/node_modules/.cache/**"],
        [],
      ),
      "build:packages": createTask('pnpm -r --filter "./packages/*" --bail build', [
        "packages/*/auto-imports.d.ts",
        "packages/*/dist/**",
        "packages/*/src/components/index.ts",
        "packages/*/src/index.ts",
        "packages/db-schema/src/generated/**",
      ]),
    },
  },
});

export default configuration;
