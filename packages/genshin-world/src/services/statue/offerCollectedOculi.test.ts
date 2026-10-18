import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { offerCollectedOculi } from "#src/services/statue/offerCollectedOculi";
import { describe, expect, test } from "vitest";

describe(offerCollectedOculi, () => {
  const OCULUS_ITEM_ID = 1;
  // A region's levels: level one takes no Oculi, and level two takes two of them
  const LEVELS: StatueLevel[] = [
    { items: [], level: 1, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
    {
      items: [{ itemCount: 2, itemId: OCULUS_ITEM_ID }],
      level: 2,
      rewards: [{ itemCount: 1, itemId: 2 }],
      staminaShare: 0,
    },
  ];

  test("offering at the Worship Statue raises the level", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    expect(offerCollectedOculi(progress, 2)).toStrictEqual({
      gainedLevels: [LEVELS[1]],
      progress: { heldCounts: {}, level: 2, levels: LEVELS },
    });
  });

  test("collected Oculi short of the next level are offered and kept", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    expect(offerCollectedOculi(progress, 1)).toStrictEqual({
      gainedLevels: [],
      progress: { heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 1, levels: LEVELS },
    });
  });

  test("offering none reaches no level", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    expect(offerCollectedOculi(progress, 0)).toStrictEqual({ gainedLevels: [], progress });
  });
});
