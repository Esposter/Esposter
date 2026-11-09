import type { RunTasks } from "#vite/models/RunTasks";

import { createTask } from "#vite/services/createTask";

// The checks are cached leaves, each traced like a build: a tree no leaf's reads changed in replays its verdict. The one
// Exception is `typecheck:workspace`, uncached because its check writes across `.nuxt`. The aggregates over them are
// Uncached, so an aggregate with no inputs of its own never replays a verdict no leaf produced. `dependsOn` runs every
// Leaf even after one fails, where `&&` stops at the first, so a red check never hides the rest
export const CHECK_TASKS: RunTasks = {
  "format:check": createTask("vp fmt --check", []),
  lint: {
    cache: false,
    command: 'echo "every lint check ran"',
    dependsOn: ["lint:oxlint", "lint:eslint", "lint:workspace", "lint:unused", "lint:workflows"],
  },
  "lint:eslint": createTask("eslint .", []),
  // The fixers write the same files, so they run in order: `&&` rather than `dependsOn`, which runs in parallel
  "lint:fix": {
    cache: false,
    command: "vp run lint:fix:oxlint && vp run lint:fix:eslint && vp run lint:fix:workspace",
  },
  "lint:fix:packages": {
    cache: false,
    command: "vp run lint:fix:packages:oxlint && vp run lint:fix:packages:workspace",
  },
  "lint:oxlint": createTask("vp lint --debug=timings --format=default --disable-nested-config", []),
  "lint:packages": {
    cache: false,
    command: 'echo "every packages lint check ran"',
    dependsOn: ["lint:packages:oxlint", "lint:packages:workspace"],
  },
  "lint:packages:oxlint": createTask("vp lint --debug=timings --format=default --disable-nested-config packages", []),
  "lint:packages:workspace": createTask('pnpm -r --filter "./packages/*" --parallel lint', []),
  "lint:unused": createTask("knip", []),
  "lint:workflows": createTask("actionlint -shellcheck= -pyflakes=", []),
  "lint:workspace": createTask("pnpm -r --parallel lint", []),
  typecheck: {
    cache: false,
    command: 'echo "every typecheck ran"',
    dependsOn: ["typecheck:root", "typecheck:workspace"],
  },
  // The packages' types are read from the `dist` the build writes, so the build is ordered first
  "typecheck:packages": {
    ...createTask('pnpm -r --filter "./packages/*" --parallel typecheck', []),
    dependsOn: ["build:packages"],
  },
  "typecheck:root": createTask("tsrs --fast", []),
  // Uncached: the check writes across the app's `.nuxt`, and excluding that directory would replay a stale verdict
  "typecheck:workspace": { cache: false, command: "pnpm -r --parallel typecheck" },
};
