import type { ReviewFile } from "#src/models/review/ReviewFile";

import { packBatches } from "#src/services/review/packBatches";
import { describe, expect, test } from "vitest";

const FILE_CAP = 2;
const LINE_CAP = 10;

describe(packBatches, () => {
  test("closes a batch before the file cap", () => {
    expect.hasAssertions();

    const files: ReviewFile[] = [
      { lines: 1, path: "a" },
      { lines: 1, path: "b" },
      { lines: 1, path: "c" },
    ];

    expect(packBatches(files, FILE_CAP, LINE_CAP)).toStrictEqual([files.slice(0, 2), files.slice(2)]);
  });

  test("closes a batch before the line cap", () => {
    expect.hasAssertions();

    const files: ReviewFile[] = [
      { lines: 6, path: "a" },
      { lines: 6, path: "b" },
    ];

    expect(packBatches(files, FILE_CAP, LINE_CAP)).toStrictEqual([[files[0]], [files[1]]]);
  });

  test("gives a file over the line cap a batch to itself", () => {
    expect.hasAssertions();

    const files: ReviewFile[] = [
      { lines: 1, path: "a" },
      { lines: 50, path: "b" },
      { lines: 1, path: "c" },
    ];

    expect(packBatches(files, FILE_CAP, LINE_CAP)).toStrictEqual([[files[0]], [files[1]], [files[2]]]);
  });

  test("packs nothing into no batches", () => {
    expect.hasAssertions();

    expect(packBatches([], FILE_CAP, LINE_CAP)).toStrictEqual([]);
  });
});
