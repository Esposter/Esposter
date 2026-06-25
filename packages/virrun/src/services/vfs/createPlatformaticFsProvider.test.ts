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
    mkdir("/dir");
    writeFile("/dir/a", "");

    expect(readFile("/dir/a")).toBe("");
    expect(exists("/dir/a")).toBe(true);
    expect(exists("/dir/b")).toBe(false);
  });

  test("mount exposes virtual files to the global fs and module loader", () => {
    expect.hasAssertions();

    const { mount, unmount, writeFile } = createPlatformaticFsProvider();
    mount("/mnt");
    withFinalizer(
      () => {
        const fs = require("node:fs");
        writeFile("/mnt/data.txt", " ");

        expect(fs.readFileSync("/mnt/data.txt", "utf8")).toBe(" ");

        writeFile("/mnt/index.js", 'module.exports = require("node:fs").readFileSync("/mnt/data.txt", "utf8")');

        // oxlint-disable-next-line import/no-absolute-path -- absolute mount path is the point: verifies the VFS module loader resolves mounted files
        expect(require("/mnt/index.js")).toBe(" ");
      },
      () => {
        unmount();
      },
    );
  });

  test("overlay reads fall through to real disk until a virtual file shadows them", () => {
    expect.hasAssertions();

    const dir = realpathSync(mkdtempSync(join(tmpdir(), "vfs-overlay-")));
    const file = join(dir, "real.txt");
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
    mount("/disposed");
    const fs = require("node:fs");
    writeFile("/disposed/x.txt", " ");

    expect(fs.existsSync("/disposed/x.txt")).toBe(true);

    dispose();

    expect(fs.existsSync("/disposed/x.txt")).toBe(false);
  });
});
