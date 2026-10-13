import { REPOSITORY_FILE_MAX_BYTE_LENGTH } from "#src/services/files/constants";
import { readRepositoryFile } from "#src/services/files/readRepositoryFile";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readRepositoryFile, () => {
  let root: string;
  let cwd: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "agent-console-read-"));
    cwd = join(root, "repository");
    mkdirSync(cwd);
  });
  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("reads a text file inside the working directory", async () => {
    expect.hasAssertions();

    writeFileSync(join(cwd, "notes.md"), "hello");

    expect(await readRepositoryFile(cwd, "notes.md")).toStrictEqual({ content: "hello", notice: "" });
  });

  test("refuses a path that leaves the working directory", async () => {
    expect.hasAssertions();

    writeFileSync(join(root, "outside.txt"), "outside");

    await expect(readRepositoryFile(cwd, "../outside.txt")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: ../outside.txt, the file is outside the session's working directory]`,
    );
  });

  test("says why a file that is not text is not shown", async () => {
    expect.hasAssertions();

    writeFileSync(join(cwd, "image.bin"), Buffer.from([0, 1, 2]));

    expect(await readRepositoryFile(cwd, "image.bin")).toStrictEqual({
      content: "",
      notice: "The file is not text, so it cannot be shown.",
    });
  });

  test("says why a file over the size cap is not shown", async () => {
    expect.hasAssertions();

    writeFileSync(join(cwd, "large.txt"), "a".repeat(REPOSITORY_FILE_MAX_BYTE_LENGTH + 1));

    expect(await readRepositoryFile(cwd, "large.txt")).toStrictEqual({
      content: "",
      notice: "The file is too large to show.",
    });
  });
});
