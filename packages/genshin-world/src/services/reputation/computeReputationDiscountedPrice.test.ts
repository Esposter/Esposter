import { computeReputationDiscountedPrice } from "#src/services/reputation/computeReputationDiscountedPrice";
import { describe, expect, test } from "vitest";

describe(computeReputationDiscountedPrice, () => {
  test("should take the discount off and round to the nearest five Mora", () => {
    expect.hasAssertions();

    expect([100, 103, 1000].map((price) => computeReputationDiscountedPrice(price))).toStrictEqual([90, 95, 900]);
  });

  test("should round a price halfway between two fives to the lower, in the player's favour", () => {
    expect.hasAssertions();

    // 225 takes 202.5, halfway between 200 and 205
    expect(computeReputationDiscountedPrice(225)).toBe(200);
  });
});
