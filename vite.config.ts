import type { UserConfig } from "vite-plus";
import type { VueOptions } from "vize";

import { BUILD_TASKS } from "#vite/buildTasks";
import { CHECK_TASKS } from "#vite/checkTasks";
import { VUE_OPTIONS } from "#vite/vueOptions";
import { defineConfig } from "vite-plus";

import oxfmtConfiguration from "./oxfmt.config.ts";
import oxlintConfiguration from "./oxlint.config.ts";

// Composed from one module per tool, as nuxt.config.ts is: the lint and format settings stay in their own files, which
// The bare binaries and the editor read directly, and the tasks in `vite/`, one module per kind. It configures no
// Bundler: the app builds through `nuxt build` from the app's own nuxt.config.ts. vize reads its options only off this
// File, so `vue` sits beside the keys Vite+ types, outside `defineConfig`.
const configuration: UserConfig & { vue: VueOptions } = {
  ...defineConfig({
    fmt: oxfmtConfiguration,
    lint: oxlintConfiguration,
    run: { tasks: { ...BUILD_TASKS, ...CHECK_TASKS } },
  }),
  vue: VUE_OPTIONS,
};

export default configuration;
