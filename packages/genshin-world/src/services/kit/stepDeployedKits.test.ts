import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepDeployedKits } from "#src/services/kit/stepDeployedKits";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OFF_FIELD_CHARACTER_ID = 0;
const OUTSIDE_CHARACTER_ID = 10_000_999;

describe(stepDeployedKits, () => {
  test("steps the kit of each deployed member with the step's seconds, on the field or off it, and none outside the team", () => {
    expect.hasAssertions();
    const onStep = vi.fn<NonNullable<Kit["onStep"]>>();
    const createCombatant = (characterId: number): Combatant => ({
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId,
      constellationCount: 0,
      elementalResonances: [],
      kit: { ...TRAVELER_KIT, onStep },
      level: 90,
    });
    const context = createKitTestContext(createCombatant(TRAVELER_CHARACTER_ID), {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, createCombatant(TRAVELER_CHARACTER_ID)],
        [OFF_FIELD_CHARACTER_ID, createCombatant(OFF_FIELD_CHARACTER_ID)],
        [OUTSIDE_CHARACTER_ID, createCombatant(OUTSIDE_CHARACTER_ID)],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OFF_FIELD_CHARACTER_ID]),
    });

    stepDeployedKits(context, 0.1);

    expect(onStep.mock.calls.map(([, combatant, stepSeconds]) => [combatant.characterId, stepSeconds])).toStrictEqual([
      [TRAVELER_CHARACTER_ID, 0.1],
      [OFF_FIELD_CHARACTER_ID, 0.1],
    ]);
  });
});
