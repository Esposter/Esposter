import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { createAttributePassiveSetModule } from "#src/services/artifact/sets/createAttributePassiveSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};

describe(createAttributePassiveSetModule, () => {
  test("prices its wearer at the amount in each of its attributes, whatever the wearer is doing", () => {
    expect.hasAssertions();

    const module = createAttributePassiveSetModule(
      [Attribute.NormalAttackDamageBonus, Attribute.ChargedAttackDamageBonus],
      0.15,
    );
    expect(module.getPassiveBonuses?.(wearer, 1, [], [])).toStrictEqual([
      { amount: 0.15, attribute: Attribute.NormalAttackDamageBonus },
      { amount: 0.15, attribute: Attribute.ChargedAttackDamageBonus },
    ]);
  });
});
