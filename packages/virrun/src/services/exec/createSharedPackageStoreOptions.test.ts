import {
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_GITIGNORE_ENTRY,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/constants";
import { TEST_TEMP_DIR_PREFIX } from "@/services/exec/constants.test";
import { createSharedPackageStoreOptions } from "@/services/exec/createSharedPackageStoreOptions";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(createSharedPackageStoreOptions, () => {
  let dir = "";

  afterEach(() => {
    if (dir) rmSync(dir, { force: true, recursive: true });
    dir = "";
  });

  test("creates a shared pnpm store and returns sandbox mount options", () => {
    expect.hasAssertions();

    dir = realpathSync(mkdtempSync(join(tmpdir(), TEST_TEMP_DIR_PREFIX)));
    const storeDir = join(
      dir,
      VIRRUN_CACHE_DIRECTORY_NAME,
      VIRRUN_STORE_DIRECTORY_NAME,
      VIRRUN_PNPM_STORE_DIRECTORY_NAME,
    );
    const options = createSharedPackageStoreOptions(dir);

    expect(existsSync(storeDir)).toBe(true);
    expect(options).toStrictEqual({
      bindDirs: [storeDir],
      env: {
        [PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY]: PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
        [PNPM_CONFIG_STORE_DIR_KEY]: storeDir,
      },
    });
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe(`${VIRRUN_GITIGNORE_ENTRY}\n`);
  });

  test("does not duplicate the cache ignore entry", () => {
    expect.hasAssertions();

    dir = realpathSync(mkdtempSync(join(tmpdir(), TEST_TEMP_DIR_PREFIX)));
    createSharedPackageStoreOptions(dir);
    createSharedPackageStoreOptions(dir);

    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe(`${VIRRUN_GITIGNORE_ENTRY}\n`);
  });

  test("adds the cache ignore entry on its own line after existing content", () => {
    expect.hasAssertions();

    dir = realpathSync(mkdtempSync(join(tmpdir(), TEST_TEMP_DIR_PREFIX)));
    writeFileSync(join(dir, ".gitignore"), "dist");
    createSharedPackageStoreOptions(dir);

    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe(`dist\n${VIRRUN_GITIGNORE_ENTRY}\n`);
  });
});
