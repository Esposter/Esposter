import { getImaginariumBlessingStats } from "#src/services/imaginarium/getImaginariumBlessingStats";
import { describe, expect, test } from "vitest";

describe(getImaginariumBlessingStats, () => {
  const BLESSING_LEVEL = 2;

  test("should give a cast member the stats of each level of Blessing", () => {
    expect.hasAssertions();

    expect(getImaginariumBlessingStats(BLESSING_LEVEL, false)).toStrictEqual({
      attack: 100,
      defense: 100,
      elementalMastery: 40,
      maxHp: 1600,
    });
  });

  test("should double a special guest's stats", () => {
    expect.hasAssertions();

    expect(getImaginariumBlessingStats(BLESSING_LEVEL, true)).toStrictEqual({
      attack: 200,
      defense: 200,
      elementalMastery: 80,
      maxHp: 3200,
    });
  });
});
