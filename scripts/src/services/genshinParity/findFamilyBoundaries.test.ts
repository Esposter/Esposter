import { findFamilyBoundaries } from "#src/services/genshinParity/findFamilyBoundaries";
import { describe, expect, test } from "vitest";

describe(findFamilyBoundaries, () => {
  test("marks where a family meets another or the ground, with the family it bounds, and not a seam within one", () => {
    expect.hasAssertions();

    // Four pixels in a row: the ground, two parts of family 0, a part of family 1
    const part = Float32Array.from([0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 0]);
    const { familyIndices, mask } = findFamilyBoundaries({ height: 1, part, width: 4 });

    expect([...mask]).toStrictEqual([1, 0, 1, 0]);
    expect([...familyIndices]).toStrictEqual([0, -1, 0, -1]);
  });
});
