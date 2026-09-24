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

  test("mount serves the provider's files to the global fs and module loader under the returned mount point", () => {
    expect.hasAssertions();

    const { dispose, mount, writeFile } = createPlatformaticFsProvider();
    writeFile(`/${TEST_FILENAME}`, " ");
    writeFile(
      "/index.js",
      `module.exports = require("node:fs").readFileSync(\`\${__dirname}/${TEST_FILENAME}\`, "utf8")`,
    );
    const mountPoint = mount();
    withFinalizer(
      () => {
        expect(require("node:fs").readFileSync(`${mountPoint}/${TEST_FILENAME}`, "utf8")).toBe(" ");
        expect(require(`${mountPoint}/index.js`)).toBe(" ");
      },
      () => {
        dispose();
      },
    );
  });

  test("a mounted provider never shadows a real path", () => {
    expect.hasAssertions();

    const file = join(temporaryDirectories.create(), TEST_FILENAME);
    writeFileSync(file, "");
    const { dispose, mount, writeFile } = createPlatformaticFsProvider();
    writeFile(file, " ");
    mount();
    withFinalizer(
      () => {
        expect(require("node:fs").readFileSync(file, "utf8")).toBe("");
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
    writeFile(`/${TEST_FILENAME}`, " ");
    const testPath = `${mount()}/${TEST_FILENAME}`;
    const fs = require("node:fs");

    expect(fs.existsSync(testPath)).toBe(true);

    dispose();

    expect(fs.existsSync(testPath)).toBe(false);
  });
});
