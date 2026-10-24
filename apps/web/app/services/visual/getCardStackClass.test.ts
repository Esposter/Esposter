import type { CardStackState } from "@/models/visual/CardStackState";

import { getCardStackClass } from "@/services/visual/getCardStackClass";
import { describe, expect, test } from "vitest";

describe(getCardStackClass, () => {
  const state: CardStackState = { cardIds: [0, 1, 2, 3], inactiveCardId: 3, maxShownCards: 3 };

  test("the card that is moving is active", () => {
    expect.hasAssertions();

    expect(getCardStackClass(0, { ...state, activeCardId: 0 })).toBe("active-card");
  });

  test("the card that has just moved is inactive", () => {
    expect.hasAssertions();

    expect(getCardStackClass(3, { ...state, activeCardId: 0 })).toBe("inactive-card");
  });

  // Before any card has moved, the last shown card is the one that starts inactive
  test("the last shown card starts inactive before any card has moved", () => {
    expect.hasAssertions();

    expect(getCardStackClass(3, { ...state, cardIds: [0, 1, 2, 3], inactiveCardId: undefined })).toBe("inactive-card");
  });

  test("a card past the second-last shown card is hidden behind it", () => {
    expect.hasAssertions();

    expect(getCardStackClass(2, { ...state, activeCardId: 0 })).toBe("of-card");
  });

  // The stack's name alternates with each offset's parity, so the animation restarts on every step
  test("a stacked card takes the even or odd sway by its offset", () => {
    expect.hasAssertions();

    expect(getCardStackClass(0, { ...state, activeCardId: 9, inactiveCardId: 9 })).toBe("normal-card normal-card-even");
    expect(getCardStackClass(1, { ...state, activeCardId: 9, inactiveCardId: 9 })).toBe("normal-card normal-card-odd");
  });
});
