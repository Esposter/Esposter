import type { CachePattern } from "#vite/models/CachePattern";

import { CachePatternBase } from "#vite/models/CachePatternBase";

// The repository root, which every task's patterns and `cwd` are relative to. Read from this file's own location, since
// `vp run -w` from a package (the app's `pnpm dev`) loads the config with that package as the working directory
export const ROOT_URL: URL = new URL("../", import.meta.url);

export const PACKAGES_DIRECTORY = "packages";

// The state pnpm writes on every install and every run, which no build's result depends on: the dependencies
// Themselves are traced file by file. Each run writes a `_tmp_<pid>_<hash>` temporary into the workspace root, beside
// The package it runs in, and renames or removes it before the run ends, so the pattern names the root and not a package
export const PNPM_STATE_PATTERNS: CachePattern[] = [
  "!**/node_modules/.pnpm-task-run-state-v1/**",
  "!node_modules/.pnpm-workspace-state-v1.json",
  { base: CachePatternBase.Workspace, pattern: "!_tmp_*" },
];

// The root project's incremental build state, which `tsrs` writes under `node_modules/.cache` rather than beside the
// Tracked root: the check reads it back and rewrites it, so it is a cache's state and not one of the check's inputs
export const ROOT_TSBUILDINFO_PATH = "node_modules/.cache/tsrs/root.tsbuildinfo";

// The declaration `@nuxt/eslint`'s typegen writes beside the app's generated ESLint config. Every ESLint run that loads
// That config reads it and rewrites it when it is absent or stale, and its content is a function of the plugins it loads
export const ESLINT_TYPEGEN_PATTERNS: string[] = ["apps/web/.nuxt/eslint-typegen.d.ts"];

// The files a package's build rewrites, or another task writes into the package, relative to the package
export const PACKAGE_REWRITTEN_PATTERNS: string[] = [
  "auto-imports.d.ts",
  "dist/**",
  "src/components/index.ts",
  "src/index.ts",
  // A tool's own cache, which a build writes into the package's `node_modules` and nothing reads back as an input
  "node_modules/.cache/**",
  // The parity page's production build, written into the world package by `build:parity`
  "parity-build/**",
];

// The generated sources a package's own build hook rewrites: db-schema's registry and genshin-world's kit map
// Only the package build excludes them, since the parity page reads the kit map and the committed game-data lock beside it
export const BUILD_HOOK_GENERATED_PATTERNS: string[] = [
  "src/generated/characterKitMap/**",
  "src/generated/relations.ts",
  "src/generated/schema.ts",
];
