import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { readLinkedDirectories } from "#src/services/sweeps/staleNames/readLinkedDirectories";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readLinkedDirectories, () => {
  const SCOPE_NAME = `@${TEST_FILENAME}`;
  const STRAY_FILENAME = `${TEST_FILENAME}.cjs`;
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "readLinkedDirectories-test-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  // Each package is linked to its store entry under `.pnpm`, and a scope's links sit one level down. A regular file
  // Beside them is not a package, and must not be read as one
  test("reads the packages a node_modules links, not a file in it or in a scope", () => {
    expect.hasAssertions();

    const modulesDirectory = join(directory, "node_modules");
    const pnpmDirectory = join(modulesDirectory, ".pnpm");
    const packageStoreDirectory = join(pnpmDirectory, TEST_FILENAME);
    const scopeStoreDirectory = join(pnpmDirectory, SCOPE_NAME);
    mkdirSync(packageStoreDirectory, { recursive: true });
    mkdirSync(scopeStoreDirectory, { recursive: true });
    mkdirSync(join(modulesDirectory, SCOPE_NAME), { recursive: true });
    symlinkSync(packageStoreDirectory, join(modulesDirectory, TEST_FILENAME));
    symlinkSync(scopeStoreDirectory, join(modulesDirectory, SCOPE_NAME, TEST_FILENAME));
    writeFileSync(join(modulesDirectory, STRAY_FILENAME), "");
    writeFileSync(join(modulesDirectory, SCOPE_NAME, STRAY_FILENAME), "");

    expect(readLinkedDirectories(modulesDirectory).toSorted()).toStrictEqual([
      realpathSync(scopeStoreDirectory),
      realpathSync(packageStoreDirectory),
    ]);
  });
});
