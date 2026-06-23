import { createPlatformaticFsProvider } from "@/services/vfs/createPlatformaticFsProvider";
import { createRequire } from "node:module";
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
    try {
      const fs = require("node:fs");
      writeFile("/mnt/data.txt", " ");

      expect(fs.readFileSync("/mnt/data.txt", "utf8")).toBe(" ");

      writeFile("/mnt/index.js", 'module.exports = require("node:fs").readFileSync("/mnt/data.txt", "utf8")');

      expect(require("/mnt/index.js")).toBe(" ");
    } finally {
      unmount();
    }
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
