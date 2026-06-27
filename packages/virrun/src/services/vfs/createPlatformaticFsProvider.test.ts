import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { TEST_DIR, TEST_FILE_NAME } from "@/services/exec/util/constants.test";
import { createPlatformaticFsProvider } from "@/services/vfs/createPlatformaticFsProvider";
import { withFinalizer } from "@esposter/shared";
import { mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);

describe(createPlatformaticFsProvider, () => {
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

        // oxlint-disable-next-line import/no-absolute-path -- absolute mount path is the point: verifies the VFS module loader resolves mounted files
        expect(require(indexPath)).toBe(" ");
      },
      () => {
        unmount();
      },
    );
  });

  test("overlay reads fall through to real disk until a virtual file shadows them", () => {
    expect.hasAssertions();

    const dir = realpathSync(mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX)));
    const file = join(dir, TEST_FILE_NAME);
    writeFileSync(file, "");
    const { dispose, mount, writeFile } = createPlatformaticFsProvider({ isOverlayEnabled: true });
    mount(dir);
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
