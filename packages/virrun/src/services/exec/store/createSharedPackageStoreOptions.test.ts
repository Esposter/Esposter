import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { createWorkspaceDir } from "@/services/exec/test/createWorkspaceDir.test";
import {
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_GITIGNORE_ENTRY,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

    dir = createWorkspaceDir();
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

    dir = createWorkspaceDir();
    createSharedPackageStoreOptions(dir);
    createSharedPackageStoreOptions(dir);

    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe(`${VIRRUN_GITIGNORE_ENTRY}\n`);
  });

  test("adds the cache ignore entry on its own line after existing content", () => {
    expect.hasAssertions();

    dir = createWorkspaceDir();
    writeFileSync(join(dir, ".gitignore"), "dist");
    createSharedPackageStoreOptions(dir);

    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe(`dist\n${VIRRUN_GITIGNORE_ENTRY}\n`);
  });

  test("leaves the gitignore untouched when the cache is already ignored in a different form", () => {
    expect.hasAssertions();

    dir = createWorkspaceDir();
    const existing = `dist\n${VIRRUN_CACHE_DIRECTORY_NAME}\n`;
    writeFileSync(join(dir, ".gitignore"), existing);
    createSharedPackageStoreOptions(dir);

    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe(existing);
  });
});
