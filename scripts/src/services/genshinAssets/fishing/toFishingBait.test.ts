import type { ExcelFishBaitRow } from "#src/models/genshinAssets/fishing/ExcelFishBaitRow";

import { toFishingBait } from "#src/services/genshinAssets/fishing/toFishingBait";
import { describe, expect, test } from "vitest";

describe(toFishingBait, () => {
  const BAIT_ID = 111_023;
  const BASE_TAG = 9200;
  const BAIT_TAG = 9201;
  const OTHER_TAG = 9202;
  // Fish 1 and 3 hold the bait's own tag, and fish 2 holds another bait's
  const fishTags = new Map<number, ReadonlySet<number>>([
    [1, new Set([BASE_TAG, BAIT_TAG])],
    [2, new Set([BASE_TAG, OTHER_TAG])],
    [3, new Set([BAIT_TAG])],
  ]);

  test("a bait draws the fish whose feature tags hold a tag it weights, a zero weight naming none", () => {
    expect.hasAssertions();

    const row: ExcelFishBaitRow = {
      featureList: [
        { featureTag: BAIT_TAG, weight: 1 },
        { featureTag: BASE_TAG, weight: 0 },
      ],
      id: BAIT_ID,
      poolIdList: [],
    };

    expect(toFishingBait(row, fishTags, new Map())).toStrictEqual({ fishIds: [1, 3], id: BAIT_ID });
  });

  test("a bait naming a pool draws that pool's fish rather than its tags", () => {
    expect.hasAssertions();

    const POOL_ID = 10_007;
    const row: ExcelFishBaitRow = {
      featureList: [{ featureTag: BASE_TAG, weight: 1 }],
      id: BAIT_ID,
      poolIdList: [POOL_ID],
    };

    expect(toFishingBait(row, fishTags, new Map([[POOL_ID, new Set([5, 6])]]))).toStrictEqual({
      fishIds: [5, 6],
      id: BAIT_ID,
    });
  });
});
