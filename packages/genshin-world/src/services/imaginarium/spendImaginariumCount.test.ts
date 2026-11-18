import { IMAGINARIUM_COMPANION_FLOWER_PRICE } from "#src/services/imaginarium/constants";
import { spendImaginariumCount } from "#src/services/imaginarium/spendImaginariumCount";
import { describe, expect, test } from "vitest";

describe(spendImaginariumCount, () => {
  test("a Companion event costs Fantasia Flowers", () => {
    expect.hasAssertions();

    expect(
      spendImaginariumCount(IMAGINARIUM_COMPANION_FLOWER_PRICE * 2, IMAGINARIUM_COMPANION_FLOWER_PRICE),
    ).toStrictEqual({ count: IMAGINARIUM_COMPANION_FLOWER_PRICE, isSpent: true });
  });

  test("a paid event is refused without enough Fantasia Flowers", () => {
    expect.hasAssertions();

    const flowers = IMAGINARIUM_COMPANION_FLOWER_PRICE - 1;

    expect(spendImaginariumCount(flowers, IMAGINARIUM_COMPANION_FLOWER_PRICE)).toStrictEqual({
      count: flowers,
      isSpent: false,
    });
  });
});
