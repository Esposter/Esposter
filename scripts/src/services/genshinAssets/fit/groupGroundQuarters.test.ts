import { groupGroundQuarters } from "#src/services/genshinAssets/fit/groupGroundQuarters";
import { describe, expect, test } from "vitest";

describe(groupGroundQuarters, () => {
  test("joins an undersized quarter to the sibling sharing an edge with the fewest samples", () => {
    expect.hasAssertions();

    // Quarter 3's edge-sharing siblings are 1 and 2, and quarter 0, diagonal from it, reads the fewest of all, so it is
    // Not the one joined
    expect(groupGroundQuarters([1500, 5000, 2000, 432], 1024)).toStrictEqual([[0], [1], [2, 3]]);
  });

  test("keeps every quarter alone when none reads under the minimum", () => {
    expect.hasAssertions();

    expect(groupGroundQuarters([1500, 5000, 2000, 1024], 1024)).toStrictEqual([[0], [1], [2], [3]]);
  });
});
