import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { delayKitEnergy } from "#src/services/kit/effects/delayKitEnergy";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
const DELAY_ID = "seedEnergy";

describe(delayKitEnergy, () => {
  test("a delay holds its energy until its seconds run out", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    delayKitEnergy(context.kitEffectState, TRAVELER_CHARACTER_ID, { energy: 6, id: DELAY_ID, seconds: 2 });
    stepKitSeconds(context, 1);

    expect(findKitStatus(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, DELAY_ID)?.stacks).toBe(6);

    stepKitSeconds(context, 1.5);

    expect(findKitStatus(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, DELAY_ID)).toBeUndefined();
  });

  test("a second delay while the first is due adds its energy to the first", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    delayKitEnergy(context.kitEffectState, TRAVELER_CHARACTER_ID, { energy: 6, id: DELAY_ID, seconds: 2 });
    stepKitSeconds(context, 1);
    delayKitEnergy(context.kitEffectState, TRAVELER_CHARACTER_ID, { energy: 6, id: DELAY_ID, seconds: 2 });

    expect(findKitStatus(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, DELAY_ID)?.stacks).toBe(12);
  });
});
