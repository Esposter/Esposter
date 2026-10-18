import type { FishBait } from "#src/models/fishing/FishBait";
import type { FishingPool } from "#src/models/fishing/FishingPool";

import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { pickFishingBait } from "#src/services/fishing/pickFishingBait";
import { describe, expect, test } from "vitest";

describe(pickFishingBait, () => {
  const REGION = "a";
  const HOUR = 0;
  const FISH_ID = 1;
  const POOLS = {
    [REGION]: [
      { id: 1, maxNum: 0, stocks: [{ type: FishingStockType.Any, weights: [{ fishId: FISH_ID, weight: 1 }] }] },
    ] as FishingPool[],
  };
  const PULLING_BAIT: FishBait = { fishIds: [FISH_ID], id: 10 };
  const OTHER_BAIT: FishBait = { fishIds: [FISH_ID + 1], id: 11 };

  test("the first held bait that pulls a fish at the point is the one a cast uses", () => {
    expect.hasAssertions();

    expect(pickFishingBait([OTHER_BAIT, PULLING_BAIT], POOLS, REGION, HOUR)).toBe(PULLING_BAIT);
    expect(pickFishingBait([OTHER_BAIT], POOLS, REGION, HOUR)).toBeUndefined();
  });
});
