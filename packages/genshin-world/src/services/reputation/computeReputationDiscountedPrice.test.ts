import { computeReputationDiscountedPrice } from "#src/services/reputation/computeReputationDiscountedPrice";
import { describe, expect, test } from "vitest";

describe(computeReputationDiscountedPrice, () => {
  test("should take the discount off and round down to a multiple of five Mora", () => {
    expect.hasAssertions();

    expect([100, 109, 1000].map((price) => computeReputationDiscountedPrice(price))).toStrictEqual([90, 95, 900]);
  });

  test("should round a discounted price between two fives down to the lower, in the player's favour", () => {
    expect.hasAssertions();

    // 103 takes 92.7, and 225 takes 202.5, each between two fives
    expect([103, 225].map((price) => computeReputationDiscountedPrice(price))).toStrictEqual([90, 200]);
  });
});
