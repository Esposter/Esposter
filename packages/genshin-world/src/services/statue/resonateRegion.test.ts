import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { resonateRegion } from "#src/services/statue/resonateRegion";
import { describe, expect, test } from "vitest";

describe(resonateRegion, () => {
  // A region's levels: level one takes no Oculi and pays its rewards when the region starts, and level two takes one Oculus
  const LEVELS: StatueLevel[] = [
    { itemCount: 0, itemId: 1, level: 1, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
    { itemCount: 1, itemId: 1, level: 2, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
  ];

  test("the first resonance starts the region at level one", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCount: 0, level: 0, levels: LEVELS };

    expect(resonateRegion(progress)).toStrictEqual({
      gainedLevels: [LEVELS[0]],
      progress: { heldCount: 0, level: 1, levels: LEVELS },
    });
  });

  test("a second resonance pays no reward again", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCount: 0, level: 1, levels: LEVELS };

    expect(resonateRegion(progress)).toStrictEqual({ gainedLevels: [], progress });
  });
});
