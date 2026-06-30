import type { rm as baseRm } from "node:fs/promises";

import { SourceType } from "@/models/source/SourceType";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { loadFilesSource } from "@/services/source/loadFilesSource";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Wrap the real fs/promises with a call-through spy on rm, so the failure-path leak test can assert dispose
// Actually removed the dir it created — deterministically, instead of counting shared-tmpdir entries that
// Parallel tests pollute with the same prefix. Every other export (mkdir/writeFile/readFile) stays real.
const { rm } = vi.hoisted(() => ({ rm: vi.fn<typeof baseRm>() }));

vi.mock(import("node:fs/promises"), async (importOriginal) => {
  const actual = await importOriginal();
  rm.mockImplementation(actual.rm);
  return { ...actual, rm };
});

describe(loadFilesSource, () => {
  const escapePath = `../${TEST_FILENAME}`;
  const escapeReason = "path escapes sandbox directory";

  beforeEach(() => {
    rm.mockClear();
  });

  test("materializes a file at a nested path into a temp directory", async () => {
    expect.hasAssertions();

    const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}`;
    const { cwd, dispose } = await loadFilesSource({ files: { [nestedPath]: " " }, type: SourceType.Files });

    await expect(readFile(join(cwd, nestedPath), "utf8")).resolves.toBe(" ");

    await dispose();
  });

  test("removes the temp directory on dispose", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadFilesSource({ files: { [TEST_FILENAME]: " " }, type: SourceType.Files });
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

    const absolutePath = join(tmpdir(), TEST_FILENAME);

    await expect(
      loadFilesSource({ files: { [absolutePath]: "" }, type: SourceType.Files }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, absolutePath, escapeReason).message}]`,
    );
  });

  test("disposes the temp directory when a path escapes the sandbox", async () => {
    expect.hasAssertions();

    await expect(
      loadFilesSource({ files: { [escapePath]: "" }, type: SourceType.Files }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, escapePath, escapeReason).message}]`,
    );

    expect(rm).toHaveBeenCalledTimes(1);

    const [removedDirectory] = takeOne(rm.mock.calls);

    expect(existsSync(removedDirectory)).toBe(false);
  });
});
