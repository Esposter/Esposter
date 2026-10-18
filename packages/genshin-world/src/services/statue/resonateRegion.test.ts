import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { resonateRegion } from "#src/services/statue/resonateRegion";
import { describe, expect, test } from "vitest";

describe(resonateRegion, () => {
  const OCULUS_ITEM_ID = 1;
  // A region's levels: level one takes no Oculi and is reached when the region starts, and level two takes one Oculus
  const LEVELS: StatueLevel[] = [
    { items: [], level: 1, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
    {
      items: [{ itemCount: 1, itemId: OCULUS_ITEM_ID }],
      level: 2,
      rewards: [{ itemCount: 1, itemId: 2 }],
      staminaShare: 0,
    },
  ];

  test("the first resonance starts the region at level one, and keeps the Oculi it holds for an offer", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 0, levels: LEVELS };

    expect(resonateRegion(progress)).toStrictEqual({ heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 1, levels: LEVELS });
  });

  test("a second resonance changes nothing", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    expect(resonateRegion(progress)).toStrictEqual(progress);
  });
});
