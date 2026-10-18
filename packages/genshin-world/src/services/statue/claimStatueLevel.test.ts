import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { claimStatueLevel } from "#src/services/statue/claimStatueLevel";
import { describe, expect, test } from "vitest";

describe(claimStatueLevel, () => {
  // A region's levels: level one takes no Oculi, and each later level takes one Oculus
  const LEVELS: StatueLevel[] = [
    { items: [], level: 1, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
    { items: [{ itemCount: 1, itemId: 1 }], level: 2, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
    { items: [{ itemCount: 1, itemId: 1 }], level: 3, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
  ];

  test("each claim pays the next level reached, one level an action", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 2, levels: LEVELS };

    expect(claimStatueLevel(progress, 0)).toStrictEqual({ claimed: LEVELS[0], claimedLevel: 1 });
    expect(claimStatueLevel(progress, 1)).toStrictEqual({ claimed: LEVELS[1], claimedLevel: 2 });
  });

  test("a claim with every reached level already claimed claims none", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 2, levels: LEVELS };

    expect(claimStatueLevel(progress, 2)).toStrictEqual({ claimed: undefined, claimedLevel: 2 });
  });
});
