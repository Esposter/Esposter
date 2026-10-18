import type { RewardItem } from "#src/models/reward/RewardItem";

import { drawRewardItems } from "#src/services/reward/drawRewardItems";
import { describe, expect, test } from "vitest";

const GOLDEN_STEP = (Math.sqrt(5) - 1) / 2;

// A roll sequence spread evenly over the unit interval, so the mean over many draws is the chance's own mean and not one
// Lucky run of rolls
const createRolls = (): (() => number) => {
  let step = 0;
  return () => {
    step += 1;
    return (step * GOLDEN_STEP) % 1;
  };
};

const getMeanCount = (item: RewardItem, draws: number): number => {
  const random = createRolls();
  let total = 0;
  for (let draw = 0; draw < draws; draw += 1) total += drawRewardItems([item], random)[0]?.count ?? 0;
  return total / draws;
};

describe(drawRewardItems, () => {
  test("an item without an average draws its count uniformly between its least and most", () => {
    expect.hasAssertions();

    expect(drawRewardItems([{ itemId: 1, maxCount: 3, minCount: 1 }], () => 0.99)).toStrictEqual([{ count: 3, id: 1 }]);
  });

  test("an item with an average draws to that average over many claims", () => {
    expect.hasAssertions();

    expect(getMeanCount({ averageCount: 3.2, itemId: 1, maxCount: 4, minCount: 3 }, 10_000)).toBeCloseTo(3.2, 2);
  });

  test("an item whose least is zero still draws to its average, which a uniform draw over its range would miss", () => {
    expect.hasAssertions();

    expect(getMeanCount({ averageCount: 0.24, itemId: 1, maxCount: 3, minCount: 0 }, 10_000)).toBeCloseTo(0.24, 2);
  });
});
