import type { ReviewFile } from "#src/models/review/ReviewFile";

import { packBatches } from "#src/services/review/packBatches";
import { describe, expect, test } from "vitest";

describe(packBatches, () => {
  const FILE_CAP = 2;
  const LINE_CAP = 10;
  const CHARACTER_CAP = 100;

  test("closes a batch before the file cap", () => {
    expect.hasAssertions();

    const files: ReviewFile[] = [
      { characters: 1, lines: 1, path: "a" },
      { characters: 1, lines: 1, path: "b" },
      { characters: 1, lines: 1, path: "c" },
    ];

    expect(packBatches(files, FILE_CAP, LINE_CAP, CHARACTER_CAP)).toStrictEqual([files.slice(0, 2), files.slice(2)]);
  });

  test("closes a batch before the line cap", () => {
    expect.hasAssertions();

    const files: ReviewFile[] = [
      { characters: 1, lines: 6, path: "a" },
      { characters: 1, lines: 6, path: "b" },
    ];

    expect(packBatches(files, FILE_CAP, LINE_CAP, CHARACTER_CAP)).toStrictEqual([[files[0]], [files[1]]]);
  });

  test("closes a batch before the character cap, which a file of few lines can reach", () => {
    expect.hasAssertions();

    const files: ReviewFile[] = [
      { characters: 60, lines: 1, path: "a" },
      { characters: 60, lines: 1, path: "b" },
    ];

    expect(packBatches(files, FILE_CAP, LINE_CAP, CHARACTER_CAP)).toStrictEqual([[files[0]], [files[1]]]);
  });

  test("gives a file over the line or the character cap a batch to itself", () => {
    expect.hasAssertions();

    const files: ReviewFile[] = [
      { characters: 1, lines: 1, path: "a" },
      { characters: 1, lines: 50, path: "b" },
      { characters: 500, lines: 1, path: "c" },
      { characters: 1, lines: 1, path: "d" },
    ];

    expect(packBatches(files, FILE_CAP, LINE_CAP, CHARACTER_CAP)).toStrictEqual([
      [files[0]],
      [files[1]],
      [files[2]],
      [files[3]],
    ]);
  });

  test("packs nothing into no batches", () => {
    expect.hasAssertions();

    expect(packBatches([], FILE_CAP, LINE_CAP, CHARACTER_CAP)).toStrictEqual([]);
  });
});
