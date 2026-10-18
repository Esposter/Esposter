import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitReaction } from "#src/models/kit/KitReaction";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombatant = (kit: Kit): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit,
  level: 1,
});

describe(getDeployedReactionBonuses, () => {
  test("adds the Elevation a passive module gives a deployed member's reaction, as the member's kit wraps it", () => {
    expect.hasAssertions();

    const elevatingModule: PassiveModule = { getPartyReactionBonus: () => ({ elevationBonus: 0.2 }) };
    const combatant = createCombatant(getPassiveKit(KIT, [elevatingModule]));
    const reaction: KitReaction = {
      combatant,
      element: Element.Electro,
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      reactionType: LunarReactionType.LunarCharged,
    };

    expect(getDeployedReactionBonuses(reaction, createKitTestContext(combatant))).toStrictEqual({
      additiveBaseDamageBonus: 0,
      criticalDamageBonus: 0,
      criticalRateBonus: 0,
      damageBonus: 0,
      elevationBonus: 0.2,
    });
  });
});
