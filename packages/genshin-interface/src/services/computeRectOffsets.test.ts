import { computeRectOffsets } from "#src/services/computeRectOffsets";
import { describe, expect, test } from "vitest";

describe(computeRectOffsets, () => {
  test("centres a piece on its anchor by a middle pivot", () => {
    expect.hasAssertions();

    expect(computeRectOffsets({ pivot: [0.5, 0.5], position: [0, 0], size: [2, 2] })).toStrictEqual({
      offsetMax: [1, 1],
      offsetMin: [-1, -1],
    });
  });

  test("insets a piece stretched between its anchors by half its negative size delta at each side", () => {
    expect.hasAssertions();

    expect(computeRectOffsets({ pivot: [0.5, 0], position: [0, 0], size: [-2, -2] })).toStrictEqual({
      offsetMax: [-1, -2],
      offsetMin: [1, 0],
    });
  });
});
