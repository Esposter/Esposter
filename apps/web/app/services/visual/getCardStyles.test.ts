import { getCardStyles } from "@/services/visual/getCardStyles";
import { describe, expect, test } from "vitest";

describe(getCardStyles, () => {
  test("each card takes the values of its own offset", () => {
    expect.hasAssertions();

    expect(getCardStyles([2, 0], [{ marginRight: "1rem", scaleY: "0.5" }])).toStrictEqual([
      {
        "--margin-right": "1rem",
        "--old-margin-right": undefined,
        "--old-scale-y": undefined,
        "--scale-y": "0.5",
        zIndex: 2,
      },
      {
        "--margin-right": undefined,
        "--old-margin-right": undefined,
        "--old-scale-y": undefined,
        "--scale-y": undefined,
        zIndex: 1,
      },
    ]);
  });
});
