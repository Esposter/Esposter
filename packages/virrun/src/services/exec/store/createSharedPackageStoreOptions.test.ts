import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import {
  GITIGNORE_FILENAME,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
  PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_KEY,
  PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_VALUE,
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
        [PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_KEY]: PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_VALUE,
      },
    });
    expect(readFileSync(join(dir, GITIGNORE_FILENAME), "utf8")).toBe(`${VIRRUN_GITIGNORE_ENTRY}\n`);
  });

  // The env is a config override for pnpm 10+, so a sandboxed `pnpm run`/`pnpm exec` skips verify-deps-before-run and
  // Never re-installs the frozen snapshot deps (the copy-up that fails writing bin shims into the overlay upper). The
  // Value must be a non-empty string pnpm reads as the enum literal `false`, not a coerced boolean or empty sentinel.
  test("disables pnpm's pre-run dependency verification so the sandbox never re-installs frozen deps", () => {
    expect.hasAssertions();

    const dir = createWorkspace();
    const { env } = createSharedPackageStoreOptions(dir, join(dir, VIRRUN_CACHE_DIRECTORY_NAME));

    expect(env?.[PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_KEY]).toBe(PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_VALUE);
    expect(PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_KEY).toBe("PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN");
    expect(PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_VALUE).toBe("false");
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
