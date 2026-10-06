import { readFileRange } from "#src/services/genshinAssets/music/readFileRange";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readFileRange, () => {
  let directory: string;
  let path: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "read-file-range-"));
    path = join(directory, "package.pck");
    writeFileSync(path, Buffer.from([0, 1, 2, 3, 4, 5]));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("reads the range", async () => {
    expect.hasAssertions();

    await using file = await open(path);

    expect(await readFileRange(file, path, 2, 3)).toStrictEqual(Buffer.from([2, 3, 4]));
  });

  test("throws when the file ends before the range", async () => {
    expect.hasAssertions();

    await using file = await open(path);

    await expect(readFileRange(file, "package.pck", 4, 4)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: package.pck, ends before byte 8]`,
    );
  });
});
