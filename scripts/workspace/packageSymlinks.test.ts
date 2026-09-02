import { readdirSync, readlinkSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The pnpm directory fetcher packs a workspace package whenever it is injected — which `pnpm deploy` always does, for
 * the Azure Functions release — and rejects any entry resolving outside the package root with
 * `ERR_PNPM_DIRECTORY_FETCHER_PATH_ESCAPE`. It walks the whole directory, so neither `files`, nor `--legacy`, nor the
 * node linker excuses the link. Nothing else fails until the deploy job does, on a push to `develop` or `main`.
 *
 * That walk is over the working tree, which is why this one is too rather than over `git ls-files`: an untracked link
 * escapes the index but not the fetcher, and `pnpm test` runs the suite through virrun, whose mirror excludes `.git`
 * (resolveMirrorExcludes) — so an index-based check is red on every local run and green only in CI, which runs vitest
 * natively.
 */
describe("workspace package symlinks", () => {
  const NODE_MODULES_DIRECTORY = "node_modules";
  const PARENT_DIRECTORY = "..";
  const repositoryRoot = resolve(import.meta.dirname, "../..");
  // `node_modules` is the one prune: it is the fetcher's own output rather than package source, and every dependency
  // Under it is a store link that escapes by design.
  const readSymlinkPaths = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) return [path];
      else if (entry.isDirectory() && entry.name !== NODE_MODULES_DIRECTORY) return readSymlinkPaths(path);
      return [];
    });

  test("never resolve outside their own package", () => {
    expect.hasAssertions();

    const packagesRoot = resolve(repositoryRoot, "packages");
    const escapingSymlinkPaths = readdirSync(packagesRoot, { withFileTypes: true }).flatMap((entry) => {
      if (!entry.isDirectory()) return [];

      const packageRoot = join(packagesRoot, entry.name);
      return readSymlinkPaths(packageRoot)
        .filter((path) => {
          // The escape is a leading `..` segment, matched as a whole component so an entry named `..fixtures` stays
          // Inside. An absolute result means `relative` could not express the target as a walk from the package — a
          // Different Windows drive — which is as far outside it as a `..` is.
          const target = relative(packageRoot, resolve(dirname(path), readlinkSync(path)));
          const [firstSegment] = target.split(sep);
          return firstSegment === PARENT_DIRECTORY || isAbsolute(target);
        })
        .map((path) => relative(repositoryRoot, path));
    });

    expect(escapingSymlinkPaths).toStrictEqual([]);
  });
});
