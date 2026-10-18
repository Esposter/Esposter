import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { releaseKitHolds } from "#src/services/kit/effects/releaseKitHolds";
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

describe(releaseKitHolds, () => {
  test("releasing ends every hold of the id at once and reports how many it ended", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });

    expect(releaseKitHolds(context.kitEffectState, TRAVELER_CHARACTER_ID, HOLD_ID)).toBe(2);
    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, HOLD_ID)).toBe(0);
    expect(releaseKitHolds(context.kitEffectState, TRAVELER_CHARACTER_ID, HOLD_ID)).toBe(0);
  });

  test("releasing one id leaves the holds of another id standing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: HOLD_ID, maximum: 3, seconds: 30 });
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, { id: "focus", maximum: 5, seconds: 30 });
    releaseKitHolds(context.kitEffectState, TRAVELER_CHARACTER_ID, HOLD_ID);

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, "focus")).toBe(1);
  });
});
