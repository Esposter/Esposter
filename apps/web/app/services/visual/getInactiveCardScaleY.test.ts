import { getInactiveCardScaleY } from "@/services/visual/getInactiveCardScaleY";
import { describe, expect, test } from "vitest";

describe(getInactiveCardScaleY, () => {
  test("a single card is not scaled", () => {
    expect.hasAssertions();

    expect(getInactiveCardScaleY({ cardCount: 1, cardScaleYRatioLoss: 0.05, maxShownCards: 3 })).toBe("1");
  });

  test("the card that has just moved settles at the back card's scale", () => {
    expect.hasAssertions();

    expect(getInactiveCardScaleY({ cardCount: 4, cardScaleYRatioLoss: 0.05, maxShownCards: 3 })).toBe("0.9");
  });
});
