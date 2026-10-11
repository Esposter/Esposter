import { runTsdown } from "#src/services/buildCache/runTsdown";
import { findRepositoryRoot } from "#src/services/shared/findRepositoryRoot";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { existsSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";

// `node --conditions=source scripts/node_modules/tsx/dist/cli.mjs scripts/src/buildCache/index.ts <package directory>`,
// Run from the workspace root, brings the package's workspace dependencies up to date, then restores its `dist` from the
// Cache when its inputs are unchanged, and otherwise builds and stores it (the build skill's cache rule). No shell is in
// This path: the dev server and the shell wrapper both start it with node.
// The packages every other package's tsdown config reads through their `dist` are built plainly once, when missing,
// Because a fresh worktree has none. Every module that imports a workspace package loads after this bootstrap, so the
// Literal below is the cache's BUILD_OUTPUT_DIRECTORY, which lives in a module that imports `@esposter/shared`.
const repositoryRoot = findRepositoryRoot(import.meta.dirname);
for (const bootstrapPackage of ["configuration", "shared"]) {
  const packageDirectory = join(repositoryRoot, "packages", bootstrapPackage);
  if (existsSync(join(packageDirectory, "dist"))) continue;
  if (runTsdown(packageDirectory, ["--no-clean"]) !== 0) process.exit(1);
}

const { buildPackageCached } = await import("#src/services/buildCache/buildPackageCached");

await runCommand(
  defineCommand({
    args: {
      directory: {
        description: "The package directory to build, relative to the working directory or absolute",
        required: true,
        type: "positional",
      },
    },
    meta: { description: "Restore a package's dist from the build cache, or build and store it", name: "build-cached" },
    run: ({ args }) => {
      // The physical path, as the cache's own root resolves through any symlink: a worktree reached through a symlinked
      // Folder otherwise names no lockfile importer, so none of its workspace dependencies is built
      buildPackageCached(realpathSync(resolve(args.directory)));
    },
  }),
);
