import type { UserConfig } from "vite-plus";

import { defineConfig } from "vite-plus";

import oxfmtConfiguration from "./oxfmt.config.ts";
import oxlintConfiguration from "./oxlint.config.ts";

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

// Composed from one module per tool, as nuxt.config.ts is: the lint and format settings stay in their own files, which
// The bare binaries and the editor read directly. It configures no bundler: the app builds through `nuxt build` from
// The app's own nuxt.config.ts.
const configuration: UserConfig = defineConfig({
  fmt: oxfmtConfiguration,
  lint: oxlintConfiguration,
  run: {
    tasks: {
      // Nothing reads the app's `.output`, so a hit restores nothing: the replay itself is the verdict that this
      // Exact tree already built green — as it is for the two checks below, which write nothing anyone reads
      "build:app": createTask(
        "pnpm -C apps/web build",
        ["apps/web/.data/**", "apps/web/.nuxt/**", "apps/web/node_modules/.cache/**"],
        [],
      ),
      "build:packages": createTask('pnpm -r --filter "./packages/*" --bail build', [
        "packages/*/auto-imports.d.ts",
        "packages/*/dist/**",
        // The atomic write the manifest rewrite goes through, which Windows reads back before the rename
        "packages/*/_tmp_*",
        "packages/*/src/components/index.ts",
        "packages/*/src/index.ts",
        "packages/db-schema/src/generated/**",
      ]),
      lint: createTask(
        "run-s --continue-on-error lint:oxlint lint:eslint lint:workspace lint:unused lint:workflows",
        [],
        [],
      ),
      typecheck: createTask("run-s --continue-on-error typecheck:root typecheck:workspace", ["apps/web/.nuxt/**"], []),
    },
  },
});

export default configuration;
