import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_DIR, TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { createPlatformaticFsProvider } from "#src/services/vfs/createPlatformaticFsProvider";
import { withFinalizer } from "@esposter/shared";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(createPlatformaticFsProvider, () => {
  const require = createRequire(import.meta.url);

  const temporaryDirectories = createTemporaryDirectoryTracker();

  afterEach(() => {
    temporaryDirectories.cleanup();
  });

  test("stores, reads, and reports existence of files (unmounted)", () => {
    expect.hasAssertions();

    const { exists, mkdir, readFile, writeFile } = createPlatformaticFsProvider();
    mkdir(TEST_DIR);
    writeFile(`${TEST_DIR}/a`, "");

    expect(readFile(`${TEST_DIR}/a`)).toBe("");
    expect(exists(`${TEST_DIR}/a`)).toBe(true);
    expect(exists(`${TEST_DIR}/b`)).toBe(false);
  });

  test("mount exposes virtual files to the global fs and module loader", () => {
    expect.hasAssertions();

    const { mount, unmount, writeFile } = createPlatformaticFsProvider();
    mount(TEST_DIR);
    withFinalizer(
      () => {
        const fs = require("node:fs");
        const dataPath = `${TEST_DIR}/a.txt`;
        const indexPath = `${TEST_DIR}/a.js`;
        writeFile(dataPath, " ");

        expect(fs.readFileSync(dataPath, "utf8")).toBe(" ");

        writeFile(indexPath, `module.exports = require("node:fs").readFileSync("${dataPath}", "utf8")`);

        expect(require(indexPath)).toBe(" ");
      },
      () => {
        unmount();
      },
    );
  });

  test("overlay reads fall through to real disk until a virtual file shadows them", () => {
    expect.hasAssertions();

    const directory = temporaryDirectories.create();
    const file = join(directory, TEST_FILENAME);
    writeFileSync(file, "");
    const { dispose, mount, writeFile } = createPlatformaticFsProvider({ isOverlayEnabled: true });
    mount(directory);
    withFinalizer(
      () => {
        const fs = require("node:fs");

        expect(fs.readFileSync(file, "utf8")).toBe("");

        writeFile(file, " ");

        expect(fs.readFileSync(file, "utf8")).toBe(" ");
      },
      () => {
        dispose();
      },
    );

    expect(readFileSync(file, "utf8")).toBe("");
  });

  test("dispose tears down the mount so interception stops", () => {
    expect.hasAssertions();

    const { dispose, mount, writeFile } = createPlatformaticFsProvider();
    mount(TEST_DIR);
    const fs = require("node:fs");
    const testPath = `${TEST_DIR}/a.txt`;
    writeFile(testPath, " ");

    expect(fs.existsSync(testPath)).toBe(true);

    dispose();

    expect(fs.existsSync(testPath)).toBe(false);
  });
});
