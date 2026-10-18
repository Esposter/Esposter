import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { findOculus } from "#src/services/statue/findOculus";
import { describe, expect, test } from "vitest";

describe(findOculus, () => {
  const OCULUS_ID = "1";
  // A region's levels: level one takes no Oculi, and level two takes the one Oculus offered
  const LEVELS: StatueLevel[] = [
    { itemCount: 0, itemId: 1, level: 1, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
    { itemCount: 1, itemId: 1, level: 2, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
  ];

  test("an offered Oculus completes a level at once", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCount: 0, level: 1, levels: LEVELS };

    const { foundOculusIds, gainedLevels, progress: nextProgress } = findOculus(new Set(), OCULUS_ID, progress);

    expect(foundOculusIds).toStrictEqual(new Set([OCULUS_ID]));
    expect(gainedLevels).toStrictEqual([LEVELS[1]]);
    expect(nextProgress).toStrictEqual({ heldCount: 0, level: 2, levels: LEVELS });
  });

  test("an Oculus found in an unstarted region is held until the region starts", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCount: 0, level: 0, levels: LEVELS };

    const { foundOculusIds, gainedLevels, progress: nextProgress } = findOculus(new Set(), OCULUS_ID, progress);

    expect(foundOculusIds).toStrictEqual(new Set([OCULUS_ID]));
    expect(gainedLevels).toStrictEqual([]);
    expect(nextProgress).toStrictEqual({ heldCount: 1, level: 0, levels: LEVELS });
  });

  test("a collected Oculus does not come back", () => {
    expect.hasAssertions();
    const foundOculusIds = new Set([OCULUS_ID]);
    const progress: OfferingProgress<StatueLevel> = { heldCount: 0, level: 1, levels: LEVELS };

    expect(findOculus(foundOculusIds, OCULUS_ID, progress)).toStrictEqual({
      foundOculusIds,
      gainedLevels: [],
      progress,
    });
  });
});
