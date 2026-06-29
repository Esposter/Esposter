import { SourceType } from "@/models/source/SourceType";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { loadFilesSource } from "@/services/source/loadFilesSource";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readTempDirectoryCount = async () =>
  (await readdir(tmpdir())).filter((name) => name.startsWith(VIRRUN_TEMP_DIR_PREFIX)).length;

describe(loadFilesSource, () => {
  const escapePath = "../escape.txt";
  const escapeReason = "path escapes sandbox directory";

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

    await expect(
      loadFilesSource({ files: { [escapePath]: "" }, type: SourceType.Files }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, escapePath, escapeReason).message}]`,
    );
  });

  test("rejects absolute path that escapes the sandbox directory", async () => {
    expect.hasAssertions();

    const absolutePath = join(tmpdir(), "escape.txt");

    await expect(
      loadFilesSource({ files: { [absolutePath]: "" }, type: SourceType.Files }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, absolutePath, escapeReason).message}]`,
    );
  });

  test("disposes the temp directory when a path escapes the sandbox", async () => {
    expect.hasAssertions();

    const before = await readTempDirectoryCount();

    await expect(
      loadFilesSource({ files: { [escapePath]: "" }, type: SourceType.Files }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, escapePath, escapeReason).message}]`,
    );

    await expect(readTempDirectoryCount()).resolves.toBe(before);
  });
});
