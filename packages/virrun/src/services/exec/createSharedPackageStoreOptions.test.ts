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

    dir = realpathSync(mkdtempSync(join(tmpdir(), "virrun-store-")));
    const storeDir = join(dir, ".virrun", "store", "pnpm");
    const options = createSharedPackageStoreOptions(dir);

    expect(existsSync(storeDir)).toBe(true);
    expect(options).toStrictEqual({
      bindDirs: [storeDir],
      env: {
        npm_config_package_import_method: "copy",
        npm_config_store_dir: storeDir,
      },
    });
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe("/.virrun/\n");
  });

  test("does not duplicate the cache ignore entry", () => {
    expect.hasAssertions();

    dir = realpathSync(mkdtempSync(join(tmpdir(), "virrun-store-")));
    createSharedPackageStoreOptions(dir);
    createSharedPackageStoreOptions(dir);

    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe("/.virrun/\n");
  });

  test("adds the cache ignore entry on its own line after existing content", () => {
    expect.hasAssertions();

    dir = realpathSync(mkdtempSync(join(tmpdir(), "virrun-store-")));
    writeFileSync(join(dir, ".gitignore"), "dist");
    createSharedPackageStoreOptions(dir);

    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe("dist\n/.virrun/\n");
  });
});
