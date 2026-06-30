import { pruneSnapshotUpper } from "@/services/exec/snapshot/pruneSnapshotUpper";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { NODE_MODULES_DIRECTORY, PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// A file inside the repo-root dependency closure — the canonical thing the lockfile determines, so the prune keeps it.
const ROOT_DEPENDENCY = join(NODE_MODULES_DIRECTORY, TEST_FILENAME);
// A workspace package directory: worth keeping only as the path to its own nested closure.
const PACKAGE_DIRECTORY = TEST_FILENAME;
// A file inside that package's nested closure — also kept.
const NESTED_DEPENDENCY = join(PACKAGE_DIRECTORY, NODE_MODULES_DIRECTORY, TEST_FILENAME);
// A source-derived artifact tree a postinstall hook left beside the nested closure (e.g. .nuxt): freezing it is the
// Staleness the prune exists to prevent, so it is dropped while the package directory around it survives.
const GENERATED_ARTIFACT = join(PACKAGE_DIRECTORY, TEST_FILENAME, TEST_FILENAME);

describe(pruneSnapshotUpper, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  afterEach(() => {
    cleanup();
  });

  // Seeds a captured upper with two dependency closures (repo-root and nested-package) beside the artifacts an
  // Install's postinstall hooks would have written, returning the upper and a path-builder to assert on.
  const seedUpper = (): { resolve: (relativePath: string) => string; upper: string } => {
    const upper = create();
    const resolve = (relativePath: string): string => join(upper, relativePath);
    const write = (relativePath: string): void => {
      const path = resolve(relativePath);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, "");
    };
    write(ROOT_DEPENDENCY);
    write(NESTED_DEPENDENCY);
    write(GENERATED_ARTIFACT);
    write(PNPM_LOCKFILE_FILENAME);
    return { resolve, upper };
  };

  test("keeps every dependency closure, the only thing the lockfile actually determines", () => {
    expect.hasAssertions();

    const { resolve, upper } = seedUpper();

    pruneSnapshotUpper(upper);

    expect(existsSync(resolve(ROOT_DEPENDENCY))).toBe(true);
    expect(existsSync(resolve(NESTED_DEPENDENCY))).toBe(true);
  });

  test("drops a source-derived artifact so the lockfile-keyed snapshot can never serve it stale", () => {
    expect.hasAssertions();

    const { resolve, upper } = seedUpper();

    pruneSnapshotUpper(upper);

    // The artifact tree goes; the package directory on the path to the nested closure stays.
    expect(existsSync(resolve(GENERATED_ARTIFACT))).toBe(false);
    expect(existsSync(resolve(join(PACKAGE_DIRECTORY, TEST_FILENAME)))).toBe(false);
    expect(existsSync(resolve(join(PACKAGE_DIRECTORY, NODE_MODULES_DIRECTORY)))).toBe(true);
  });

  test("drops a file the install rewrote outside any node_modules", () => {
    expect.hasAssertions();

    const { resolve, upper } = seedUpper();

    pruneSnapshotUpper(upper);

    expect(existsSync(resolve(PNPM_LOCKFILE_FILENAME))).toBe(false);
  });
});
