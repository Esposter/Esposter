import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { offerOculus } from "#src/services/statue/offerOculus";
import { describe, expect, test } from "vitest";

describe(offerOculus, () => {
  const ANEMOCULUS_ITEM_ID = 107_001;
  const levels: StatueLevel[] = [
    { level: 1, oculusCount: 0, oculusItemId: 0, rewards: [], staminaShare: 0 },
    { level: 2, oculusCount: 1, oculusItemId: ANEMOCULUS_ITEM_ID, rewards: [], staminaShare: 7 },
    { level: 3, oculusCount: 2, oculusItemId: ANEMOCULUS_ITEM_ID, rewards: [], staminaShare: 7 },
  ];

  test("an Oculus short of the next level's count is held", () => {
    expect.hasAssertions();

    expect(offerOculus({ heldOculusCount: 0, level: 2, levels })).toStrictEqual({
      gainedLevels: [],
      region: { heldOculusCount: 1, level: 2, levels },
    });
  });

  test("the next level is reached once its Oculi are held, which it takes off the count", () => {
    expect.hasAssertions();

    expect(offerOculus({ heldOculusCount: 0, level: 1, levels })).toStrictEqual({
      gainedLevels: [levels[1]],
      region: { heldOculusCount: 0, level: 2, levels },
    });
  });

  test("each level the held Oculi cover is reached in turn", () => {
    expect.hasAssertions();

    expect(offerOculus({ heldOculusCount: 2, level: 1, levels })).toStrictEqual({
      gainedLevels: [levels[1], levels[2]],
      region: { heldOculusCount: 0, level: 3, levels },
    });
  });

  test("past the last level the Oculi are held without a level to reach", () => {
    expect.hasAssertions();

    expect(offerOculus({ heldOculusCount: 1, level: 3, levels })).toStrictEqual({
      gainedLevels: [],
      region: { heldOculusCount: 2, level: 3, levels },
    });
  });
});
