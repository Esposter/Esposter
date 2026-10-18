import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { OCULUS_ADVENTURE_EXP } from "#src/services/statue/constants";
import { findOculus } from "#src/services/statue/findOculus";
import { describe, expect, test } from "vitest";

describe(findOculus, () => {
  const OCULUS_ID = "1";
  const OCULUS_ITEM_ID = 1;
  // A region's levels: level one takes no Oculi, and level two takes the one Oculus offered
  const LEVELS: StatueLevel[] = [
    { items: [], level: 1, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
    {
      items: [{ itemCount: 1, itemId: OCULUS_ITEM_ID }],
      level: 2,
      rewards: [{ itemCount: 1, itemId: 2 }],
      staminaShare: 0,
    },
  ];

  test("touching an Oculus collects it and gives Adventure EXP", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 0, levels: LEVELS };

    expect(findOculus(new Set(), OCULUS_ID, progress)).toStrictEqual({
      adventureExp: OCULUS_ADVENTURE_EXP,
      foundOculusIds: new Set([OCULUS_ID]),
      gainedLevels: [],
      progress: { heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 0, levels: LEVELS },
    });
  });

  test("an offered Oculus completes a level at once", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    const { foundOculusIds, gainedLevels, progress: nextProgress } = findOculus(new Set(), OCULUS_ID, progress);

    expect(foundOculusIds).toStrictEqual(new Set([OCULUS_ID]));
    expect(gainedLevels).toStrictEqual([LEVELS[1]]);
    expect(nextProgress).toStrictEqual({ heldCounts: {}, level: 2, levels: LEVELS });
  });

  test("an Oculus found in an unstarted region is held until the region starts", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 0, levels: LEVELS };

    const { foundOculusIds, gainedLevels, progress: nextProgress } = findOculus(new Set(), OCULUS_ID, progress);

    expect(foundOculusIds).toStrictEqual(new Set([OCULUS_ID]));
    expect(gainedLevels).toStrictEqual([]);
    expect(nextProgress).toStrictEqual({ heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 0, levels: LEVELS });
  });

  test("a collected Oculus does not come back", () => {
    expect.hasAssertions();
    const foundOculusIds = new Set([OCULUS_ID]);
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    expect(findOculus(foundOculusIds, OCULUS_ID, progress)).toStrictEqual({
      adventureExp: 0,
      foundOculusIds,
      gainedLevels: [],
      progress,
    });
  });
});
