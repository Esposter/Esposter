import type { UserConfig } from "vite-plus";

import { BUILD_TASKS } from "#vite/buildTasks";
import { CHECK_TASKS } from "#vite/checkTasks";
import { defineConfig } from "vite-plus";

import oxfmtConfiguration from "./oxfmt.config.ts";
import oxlintConfiguration from "./oxlint.config.ts";

// Composed from one module per tool, as nuxt.config.ts is: the lint and format settings stay in their own files, which
// The bare binaries and the editor read directly, and the tasks in `vite/`, one module per kind. It configures no
// Bundler: the app builds through `nuxt build` from the app's own nuxt.config.ts.
const configuration: UserConfig = defineConfig({
  fmt: oxfmtConfiguration,
  lint: oxlintConfiguration,
  run: { tasks: { ...BUILD_TASKS, ...CHECK_TASKS } },
});

export default configuration;
