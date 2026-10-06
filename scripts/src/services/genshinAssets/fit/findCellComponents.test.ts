import { findCellComponents } from "#src/services/genshinAssets/fit/findCellComponents";
import { describe, expect, test } from "vitest";

describe(findCellComponents, () => {
  // A grid three wide: cells 0 and 2 sit on either side of its seam, 4 below the middle of the first row
  const width = 3;

  test("joins cells through their four neighbours and never across a corner", () => {
    expect.hasAssertions();

    expect(findCellComponents([0, 1, 5], { width })).toStrictEqual([[0, 1], [5]]);
  });

  test("joins a wrapped grid's cells across its seam", () => {
    expect.hasAssertions();

    expect(findCellComponents([0, 2], { width })).toStrictEqual([[0], [2]]);
    expect(findCellComponents([0, 2], { isWrapped: true, width })).toStrictEqual([[0, 2]]);
  });
});
