import { getFileSize } from "#src/services/getFileSize";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(getFileSize, () => {
  const TEST_FILENAME = "a";
  let directory = "";

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), TEST_FILENAME));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("is the file's size in bytes", () => {
    expect.hasAssertions();

    const filePath = join(directory, TEST_FILENAME);
    writeFileSync(filePath, " ");

    expect(getFileSize(filePath)).toBe(1);
  });
});
