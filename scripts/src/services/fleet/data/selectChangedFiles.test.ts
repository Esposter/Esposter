import { selectChangedFiles } from "#src/services/fleet/data/selectChangedFiles";
import { describe, expect, test } from "vitest";

const SAME = { mtime: 1, name: "same.png", size: 2 };

describe(selectChangedFiles, () => {
  test("selects the source's files the target lacks, or holds at another size or mtime", () => {
    expect.hasAssertions();

    const missing = { mtime: 1, name: "missing.png", size: 2 };
    const resized = { mtime: 1, name: "resized.png", size: 2 };
    const retimed = { mtime: 1, name: "retimed.png", size: 2 };
    const target = [SAME, { ...resized, size: 3 }, { ...retimed, mtime: 9 }];
    expect(selectChangedFiles([SAME, missing, resized, retimed], target)).toStrictEqual([missing, resized, retimed]);
  });

  test("leaves out files only the target has", () => {
    expect.hasAssertions();

    expect(selectChangedFiles([], [SAME])).toStrictEqual([]);
  });
});
