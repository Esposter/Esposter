import type { UserConfig } from "vite-plus";

import { existsSync, readdirSync, readFileSync } from "node:fs";
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

const PACKAGES_DIRECTORY = "packages";

// The files a package's build rewrites, or another task writes into the package, relative to the package
const PACKAGE_REWRITTEN_PATTERNS = [
  "auto-imports.d.ts",
  "dist/**",
  // The atomic write the manifest rewrite goes through, which Windows reads back before the rename
  "_tmp_*",
  "src/components/index.ts",
  "src/index.ts",
  "src/generated/**",
  // A tool's own cache, which a build writes into the package's `node_modules` and nothing reads back as an input
  "node_modules/.cache/**",
  // The parity page's production build, written into the world package by `build:parity`
  "parity-build/**",
];

// Each package with a build script is a task of its own, run in its directory and ordered after the builds of the
// Workspace packages it depends on, so an edit rebuilds that package and the ones downstream while the rest replay.
// The manifests are read rather than listed, so a new package gains its task with no edit here.
interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name: string;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

// Read from the config file's own directory, since `vp run -w` from a package (the app's `pnpm dev`) loads it with
// That package as the working directory, while the tasks' patterns and `cwd` below stay relative to the root package
const readPackageBuildManifests = () =>
  readdirSync(new URL(`${PACKAGES_DIRECTORY}/`, import.meta.url)).flatMap((directory) => {
    const manifestUrl = new URL(`${PACKAGES_DIRECTORY}/${directory}/package.json`, import.meta.url);
    // A folder with no manifest is no package: a deleted package's restored build output, or a checkout's leftovers
    if (!existsSync(manifestUrl)) return [];
    // oxlint-disable-next-line no-restricted-properties -- the root config cannot import `@esposter/shared`, whose `dist` is one of the builds this file orders, and no manifest carries a Date to revive
    const manifest: PackageManifest = JSON.parse(readFileSync(manifestUrl, "utf8"));
    return manifest.scripts?.build ? [{ directory, manifest }] : [];
  });

const getBuildTaskName = (directory: string) => `build:${directory}`;

const readPackageBuildTasks = () => {
  const buildManifests = readPackageBuildManifests();
  const buildTaskNameMap = new Map(
    buildManifests.map(({ directory, manifest }) => [manifest.name, getBuildTaskName(directory)]),
  );
  return buildManifests.map(({ directory, manifest }) => {
    const dependencyNames = [
      manifest.dependencies,
      manifest.devDependencies,
      manifest.optionalDependencies,
      manifest.peerDependencies,
    ].flatMap((dependencies) => Object.keys(dependencies ?? {}));
    return [
      getBuildTaskName(directory),
      {
        cache: {
          input: [
            { auto: true },
            ...PNPM_STATE_PATTERNS,
            // Resolved from the workspace root, as the task belongs to it rather than to the package its `cwd` names
            ...PACKAGE_REWRITTEN_PATTERNS.map((pattern) => ({
              base: "workspace",
              pattern: `!${PACKAGES_DIRECTORY}/${directory}/${pattern}`,
            })),
          ],
          output: [{ auto: true }, ...PNPM_STATE_PATTERNS],
        },
        command: "pnpm run build",
        cwd: `${PACKAGES_DIRECTORY}/${directory}`,
        dependsOn: dependencyNames.flatMap((dependencyName) => buildTaskNameMap.get(dependencyName) ?? []),
      },
    ] as const;
  });
};

const packageBuildTasks = readPackageBuildTasks();

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
      ...Object.fromEntries(packageBuildTasks),
      // The libraries as a set: the per-package tasks do the caching, so this one only orders them
      "build:packages": {
        cache: false,
        command: 'echo "every package built"',
        dependsOn: packageBuildTasks.map(([taskName]) => taskName),
      },
      // The parity page's production build, which `genshin:parity load` measures, cached as a package's is: a load run
      // Replays it while nothing the page reads has moved. The world package is built first, as the page imports it
      "build:parity": {
        cache: {
          input: [
            { auto: true },
            ...PNPM_STATE_PATTERNS,
            // A package build's rewritten files, the auto-imports declaration and this build's own output among them
            ...PACKAGE_REWRITTEN_PATTERNS.map((pattern) => ({
              base: "workspace" as const,
              pattern: `!${PACKAGES_DIRECTORY}/genshin-world/${pattern}`,
            })),
          ],
          output: [{ auto: true }, ...PNPM_STATE_PATTERNS],
        },
        command: "pnpm run build:parity",
        cwd: `${PACKAGES_DIRECTORY}/genshin-world`,
        dependsOn: [getBuildTaskName("genshin-world")],
      },
      // The checks are cached leaves, each traced like a build: a tree no leaf's reads changed in replays its verdict. The one
      // Exception is `typecheck:workspace`, uncached because its check writes across `.nuxt`. The aggregates over them are
      // Uncached, so an aggregate with no inputs of its own never replays a verdict no leaf produced. `dependsOn` runs every
      // Leaf even after one fails, where `&&` stops at the first, so a red check never hides the rest
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
      "lint:packages:oxlint": createTask(
        "vp lint --debug=timings --format=default --disable-nested-config packages",
        [],
      ),
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
      "typecheck:root": createTask("tsc", []),
      // Uncached: the check writes across the app's `.nuxt`, and excluding that directory would replay a stale verdict
      "typecheck:workspace": { cache: false, command: "pnpm -r --parallel typecheck" },
    },
  },
});

export default configuration;
