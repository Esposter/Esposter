import type { RunTasks } from "#vite/models/RunTasks";

import { ROOT_TSBUILDINFO_PATH } from "#vite/services/constants";
import { createTask } from "#vite/services/createTask";

// The checks are cached leaves, each traced like a build: a tree no leaf's reads changed in replays its verdict.
// A file a leaf reads and rewrites, such as a generated declaration or a build info, is traced like any other.
// Such a file is restored on a cache hit.
// The aggregates over the leaves are uncached.
// So an aggregate with no inputs of its own never replays a verdict no leaf produced.
// Every leaf runs even after one fails, since `dependsOn` runs them all where `&&` stops at the first.
// A red check hides none.
export const CHECK_TASKS: RunTasks = {
  "format:check": createTask("vp fmt --check"),
  lint: {
    cache: false,
    command: 'echo "every lint check ran"',
    dependsOn: ["lint:oxlint", "lint:vue", "lint:unused", "lint:workflows"],
  },
  // The fixers write the same files, so they run in order: `&&` rather than `dependsOn`, which runs in parallel
  "lint:fix": { cache: false, command: "vp run lint:fix:oxlint && vp run lint:fix:vue" },
  "lint:fix:packages": { cache: false, command: "vp run lint:fix:packages:oxlint && vp run lint:fix:packages:vue" },
  "lint:oxlint": createTask("vp lint --debug=timings --format=default --disable-nested-config"),
  "lint:packages": {
    cache: false,
    command: 'echo "every packages lint check ran"',
    dependsOn: ["lint:packages:oxlint", "lint:packages:vue"],
  },
  "lint:packages:oxlint": createTask("vp lint --debug=timings --format=default --disable-nested-config packages"),
  "lint:packages:vue": createTask('vize lint "packages/**/*.vue"'),
  "lint:unused": createTask("knip"),
  // The template pass: oxlint reads only a component's script, so vize lints each component's template
  "lint:vue": createTask('vize lint "**/*.vue"'),
  "lint:workflows": createTask("actionlint -shellcheck= -pyflakes="),
  typecheck: {
    cache: false,
    command: 'echo "every typecheck ran"',
    dependsOn: ["typecheck:root", "typecheck:workspace"],
  },
  // The packages' types are read from the `dist` the build writes, so the build is ordered first
  "typecheck:packages": {
    ...createTask('pnpm -r --filter "./packages/*" --parallel typecheck'),
    dependsOn: ["build:packages"],
  },
  "typecheck:root": createTask(`tsrs --fast --tsBuildInfoFile ${ROOT_TSBUILDINFO_PATH}`),
  "typecheck:workspace": createTask("pnpm -r --parallel typecheck"),
};
