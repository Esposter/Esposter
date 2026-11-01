import type { FishBait } from "#src/models/fishing/FishBait";
import type { StandingFishingStock } from "#src/models/fishing/StandingFishingStock";

import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { getFishingStockKey } from "#src/services/fishing/getFishingStockKey";
import { pickFishingBait } from "#src/services/fishing/pickFishingBait";
import { describe, expect, test } from "vitest";

describe(pickFishingBait, () => {
  const FISH_ID = 1;
  const STANDING_STOCKS: StandingFishingStock[] = [
    { stockKey: getFishingStockKey(1, FishingStockType.Any), weights: [{ fishId: FISH_ID, weight: 1 }] },
  ];
  const PULLING_BAIT: FishBait = { fishIds: [FISH_ID], id: 10 };
  const OTHER_BAIT: FishBait = { fishIds: [FISH_ID + 1], id: 11 };

  test("the first held bait that pulls a fish from the standing stocks is the one a cast uses", () => {
    expect.hasAssertions();

    expect(pickFishingBait([OTHER_BAIT, PULLING_BAIT], STANDING_STOCKS)).toBe(PULLING_BAIT);
    expect(pickFishingBait([OTHER_BAIT], STANDING_STOCKS)).toBeUndefined();
  });
});
