import { SourceType } from "@/models/source/SourceType";
import { loadFilesSource } from "@/services/source/loadFilesSource";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readSandboxDirCount = async () => (await readdir(tmpdir())).filter((name) => name.startsWith("sandbox-")).length;

describe(loadFilesSource, () => {
  test("materializes files (including nested paths) into a temp directory", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadFilesSource({
      files: { "a.txt": "", "nested/b.txt": " " },
      type: SourceType.Files,
    });

    await expect(readFile(join(cwd, "a.txt"), "utf8")).resolves.toBe("");
    await expect(readFile(join(cwd, "nested/b.txt"), "utf8")).resolves.toBe(" ");

    await dispose();
  });

  test("removes the temp directory on dispose", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadFilesSource({ files: { "a.txt": " " }, type: SourceType.Files });
    await dispose();

    expect(existsSync(cwd)).toBe(false);
  });

  test("rejects relative path that escapes the sandbox directory", async () => {
    expect.hasAssertions();

    await expect(loadFilesSource({ files: { "../escape.txt": "" }, type: SourceType.Files })).rejects.toThrow(
      "path escapes sandbox directory",
    );
  });

  test("rejects absolute path that escapes the sandbox directory", async () => {
    expect.hasAssertions();

    await expect(
      loadFilesSource({ files: { [join(tmpdir(), "escape.txt")]: "" }, type: SourceType.Files }),
    ).rejects.toThrow("path escapes sandbox directory");
  });

  test("disposes the temp directory when a path escapes the sandbox", async () => {
    expect.hasAssertions();

    const before = await readSandboxDirCount();

    await expect(loadFilesSource({ files: { "../escape.txt": "" }, type: SourceType.Files })).rejects.toThrow(
      "path escapes sandbox directory",
    );

    await expect(readSandboxDirCount()).resolves.toBe(before);
  });
});
