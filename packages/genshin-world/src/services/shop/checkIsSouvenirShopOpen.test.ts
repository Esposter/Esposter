import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { checkIsSouvenirShopOpen } from "#src/services/shop/checkIsSouvenirShopOpen";
import { describe, expect, test } from "vitest";

describe(checkIsSouvenirShopOpen, () => {
  const levels: OfferingLevel[] = [1, 2, 3].map((level) => ({
    items: [{ itemCount: 1, itemId: 1 }],
    level,
    rewards: [],
  }));

  test("a Souvenir Shop stays closed until its offering is at its last level", () => {
    expect.hasAssertions();
    expect(checkIsSouvenirShopOpen(2, levels)).toBe(false);
    expect(checkIsSouvenirShopOpen(3, levels)).toBe(true);
  });

  test("a Souvenir Shop stays closed while the game's table holds no levels", () => {
    expect.hasAssertions();
    expect(checkIsSouvenirShopOpen(3, [])).toBe(false);
  });
});
