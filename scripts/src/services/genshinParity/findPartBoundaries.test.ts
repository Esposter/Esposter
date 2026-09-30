import { findPartBoundaries } from "#src/services/genshinParity/findPartBoundaries";
import { describe, expect, test } from "vitest";

describe(findPartBoundaries, () => {
  test("marks where a part meets another or the ground, with the family of the part it bounds", () => {
    expect.hasAssertions();

    // Three pixels in a row: the ground, a part of family 0, a part of family 1
    const part = Float32Array.from([0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 0]);
    const { familyIndices, mask } = findPartBoundaries({ height: 1, part, width: 3 });

    expect([...mask]).toStrictEqual([1, 1, 0]);
    expect([...familyIndices]).toStrictEqual([0, 0, -1]);
  });
});
