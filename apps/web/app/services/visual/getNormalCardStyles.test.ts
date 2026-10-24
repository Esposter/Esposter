import { getNormalCardStyles } from "@/services/visual/getNormalCardStyles";
import { describe, expect, test } from "vitest";

describe(getNormalCardStyles, () => {
  const geometry = { cardCount: 4, cardScaleYRatioLoss: 0.05, maxShownCards: 3, scale: 2 };

  test("each stacked card steps left by the scale and takes the card behind it as its old values", () => {
    expect.hasAssertions();

    expect(getNormalCardStyles(geometry)).toStrictEqual([
      { marginRight: "4rem", oldMarginRight: "2rem", oldScaleY: "0.95", scaleY: "1" },
      { marginRight: "2rem", oldMarginRight: "0rem", oldScaleY: "0.9", scaleY: "0.95" },
      { marginRight: "0rem", oldMarginRight: undefined, oldScaleY: "0.9", scaleY: "0.9" },
    ]);
  });

  test("a stack holds at most the shown cards and pads the rest of its slots", () => {
    expect.hasAssertions();

    expect(getNormalCardStyles({ ...geometry, cardCount: 2 })).toStrictEqual([
      { marginRight: "0rem", oldMarginRight: undefined, oldScaleY: "1", scaleY: "1" },
      {},
      {},
    ]);
  });
});
