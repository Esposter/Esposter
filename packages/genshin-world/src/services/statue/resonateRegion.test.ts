import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { LEVELS, OCULUS_ITEM_ID } from "#src/services/statue/constants.test";
import { resonateRegion } from "#src/services/statue/resonateRegion";
import { describe, expect, test } from "vitest";

describe(resonateRegion, () => {
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
