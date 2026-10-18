import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const [KIT_HIT] = TRAVELER_KIT.normalAttacks[0].hits;

const createCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  element: Element.Anemo,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe(queueKitPassiveHit, () => {
  test("queues a passive's extra hit to strike from the striker's body, with no attack tag", () => {
    expect.hasAssertions();
    const combatant = createCombatant();
    const context = createKitTestContext(combatant);
    queueKitPassiveHit(context, combatant, KIT_HIT);

    expect(context.strikes).toStrictEqual([{ body: context.body, combatant, hit: KIT_HIT }]);
  });
});
