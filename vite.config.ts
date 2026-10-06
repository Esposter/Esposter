import type { UserConfig } from "vite-plus";

import { defineConfig } from "vite-plus";

// Read by `vp run` alone, and configures no bundler: the app builds through `nuxt build` from apps/web/nuxt.config.ts.
// Each task runs the script it is named after, with the files that script rewrites kept out of its inputs.
// Without that exclusion `vp` refuses to cache a task; the files stay outputs, so a hit restores them.
const PNPM_TASK_STATE = "!**/node_modules/.pnpm-task-run-state-v1/**";

const createTask = (script: string, rewrittenPatterns: string[]) => ({
  cache: {
    input: [{ auto: true }, PNPM_TASK_STATE, ...rewrittenPatterns.map((pattern) => `!${pattern}`)],
    output: [{ auto: true }, PNPM_TASK_STATE],
  },
  command: `pnpm ${script}`,
});

const configuration: UserConfig = defineConfig({
  run: {
    tasks: {
      "cached:build": createTask("-C apps/web build", [
        "apps/web/.data/**",
        "apps/web/.nuxt/**",
        "apps/web/node_modules/.cache/**",
      ]),
      "cached:build:packages": createTask("build:packages", ["packages/*/dist/**", "packages/*/src/**/index.ts"]),
      "cached:typecheck:root": createTask("typecheck:root", ["tsconfig.tsbuildinfo"]),
    },
  },
});

export default configuration;
