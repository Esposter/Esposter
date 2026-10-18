import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
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
const HOLD_ID = "seed";

describe(addKitHold, () => {
  test("holds stop at their maximum, so a hold added past it adds none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hold = 0; hold < 4; hold++)
      addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, HOLD_ID)).toBe(3);
  });

  test("each hold runs out on its own seconds, which frees its place for the next", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });
    stepKitSeconds(context, 10);
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });
    stepKitSeconds(context, 21);

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, HOLD_ID)).toBe(2);

    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, HOLD_ID)).toBe(3);
  });

  test("a hold given infinite seconds stands however long the team runs", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      id: HOLD_ID,
      maximum: 3,
      seconds: Number.POSITIVE_INFINITY,
    });
    stepKitSeconds(context, 1000);

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, HOLD_ID)).toBe(1);
  });

  test("holds of different ids count apart", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: "focus", maximum: 5, seconds: 30 });

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, HOLD_ID)).toBe(1);
  });
});
