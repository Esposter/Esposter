import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import {
  GITIGNORE_FILENAME,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_GITIGNORE_ENTRY,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(createSharedPackageStoreOptions, () => {
  const { cleanup, createWorkspace } = createTemporaryDirectoryTracker();

  afterEach(() => {
    cleanup();
  });

  test("creates a shared pnpm store and returns sandbox mount options", () => {
    expect.hasAssertions();

    const dir = createWorkspace();
    const cacheRoot = join(dir, VIRRUN_CACHE_DIRECTORY_NAME);
    const storeDir = join(cacheRoot, VIRRUN_STORE_DIRECTORY_NAME, VIRRUN_PNPM_STORE_DIRECTORY_NAME);
    const options = createSharedPackageStoreOptions(dir, cacheRoot);

    expect(existsSync(storeDir)).toBe(true);
    expect(options).toStrictEqual({
      bindDirs: [storeDir],
      env: {
        [PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY]: PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
        [PNPM_CONFIG_STORE_DIR_KEY]: storeDir,
      },
    });
    expect(readFileSync(join(dir, GITIGNORE_FILENAME), "utf8")).toBe(`${VIRRUN_GITIGNORE_ENTRY}\n`);
  });

  test("does not duplicate the cache ignore entry", () => {
    expect.hasAssertions();

    const dir = createWorkspace();
    createSharedPackageStoreOptions(dir, join(dir, VIRRUN_CACHE_DIRECTORY_NAME));
    createSharedPackageStoreOptions(dir, join(dir, VIRRUN_CACHE_DIRECTORY_NAME));

    expect(readFileSync(join(dir, GITIGNORE_FILENAME), "utf8")).toBe(`${VIRRUN_GITIGNORE_ENTRY}\n`);
  });

  test("adds the cache ignore entry on its own line after existing content", () => {
    expect.hasAssertions();

    const dir = createWorkspace();
    writeFileSync(join(dir, GITIGNORE_FILENAME), TEST_FILENAME);
    createSharedPackageStoreOptions(dir, join(dir, VIRRUN_CACHE_DIRECTORY_NAME));

    expect(readFileSync(join(dir, GITIGNORE_FILENAME), "utf8")).toBe(`${TEST_FILENAME}\n${VIRRUN_GITIGNORE_ENTRY}\n`);
  });

  test("leaves the gitignore untouched when the cache is already ignored in a different form", () => {
    expect.hasAssertions();

    const dir = createWorkspace();
    const existingGitignore = `${TEST_FILENAME}\n${VIRRUN_CACHE_DIRECTORY_NAME}\n`;
    writeFileSync(join(dir, GITIGNORE_FILENAME), existingGitignore);
    createSharedPackageStoreOptions(dir, join(dir, VIRRUN_CACHE_DIRECTORY_NAME));

    expect(readFileSync(join(dir, GITIGNORE_FILENAME), "utf8")).toBe(existingGitignore);
  });
});
