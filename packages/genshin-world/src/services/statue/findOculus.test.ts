import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { OCULUS_ADVENTURE_EXP } from "#src/services/statue/constants";
import { LEVELS, OCULUS_ITEM_ID } from "#src/services/statue/constants.test";
import { findOculus } from "#src/services/statue/findOculus";
import { describe, expect, test } from "vitest";

describe(findOculus, () => {
  const OCULUS_ID = "1";

  test("touching an Oculus collects it and gives Adventure EXP", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 0, levels: LEVELS };

    expect(findOculus(new Set(), OCULUS_ID, progress)).toStrictEqual({
      adventureExp: OCULUS_ADVENTURE_EXP,
      foundOculusIds: new Set([OCULUS_ID]),
      progress: { heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 0, levels: LEVELS },
    });
  });

  test("a found Oculus is held until the Worship Statue offers it", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    const { foundOculusIds, progress: nextProgress } = findOculus(new Set(), OCULUS_ID, progress);

    expect(foundOculusIds).toStrictEqual(new Set([OCULUS_ID]));
    expect(nextProgress).toStrictEqual({ heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 1, levels: LEVELS });
  });

  test("an Oculus found in an unstarted region is held until the region starts", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 0, levels: LEVELS };

    const { foundOculusIds, progress: nextProgress } = findOculus(new Set(), OCULUS_ID, progress);

    expect(foundOculusIds).toStrictEqual(new Set([OCULUS_ID]));
    expect(nextProgress).toStrictEqual({ heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 0, levels: LEVELS });
  });

  test("a collected Oculus does not come back", () => {
    expect.hasAssertions();
    const foundOculusIds = new Set([OCULUS_ID]);
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    expect(findOculus(foundOculusIds, OCULUS_ID, progress)).toStrictEqual({
      adventureExp: 0,
      foundOculusIds,
      progress,
    });
  });
});
