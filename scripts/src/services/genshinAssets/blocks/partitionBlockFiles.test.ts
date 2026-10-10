import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

import { partitionBlockFiles } from "#src/services/genshinAssets/blocks/partitionBlockFiles";
import { describe, expect, test } from "vitest";

const file = (path: string, size: number): BlockFile => ({ path, size });

describe(partitionBlockFiles, () => {
  test("cuts consecutive files at the byte shares they start in, so a large file stands alone", () => {
    expect.hasAssertions();

    const files = [file("00/a.blk", 100), file("01/b.blk", 1), file("01/c.blk", 1), file("02/d.blk", 1)];

    expect(partitionBlockFiles(files, 2)).toStrictEqual([[files[0]], [files[1], files[2], files[3]]]);
  });

  test("drops the runs a shard count past the number of files leaves empty", () => {
    expect.hasAssertions();

    const files = [file("00/a.blk", 10), file("00/b.blk", 10)];

    expect(partitionBlockFiles(files, 5)).toStrictEqual([[files[0]], [files[1]]]);
  });
});
