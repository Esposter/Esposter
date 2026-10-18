import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { priceEnemyReactions } from "#src/services/kit/priceEnemyReactions";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const LEVEL = 90;
const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
const swirl = { element: Element.Pyro, reactionType: TransformativeReactionType.Swirl };

describe(priceEnemyReactions, () => {
  const createCombatant = (kit = TRAVELER_KIT): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: 100 }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    element: Element.Anemo,
    elementalResonances: [],
    kit,
    level: LEVEL,
  });

  test("a transformative reaction its strike triggers takes its creator's party reaction DMG Bonus in its multiplier", () => {
    expect.hasAssertions();
    const creator = createCombatant({ ...TRAVELER_KIT, getPartyReactionBonus: () => ({ damageBonus: 0.6 }) });
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(creator, { enemyTables });

    const { transformativeDamage } = priceEnemyReactions(kind, enemy, [swirl], creator, Element.Pyro, context);

    expect(transformativeDamage).toBeCloseTo(
      getTransformativeDamage(TransformativeReactionType.Swirl, LEVEL, 0, kind.elementResistances[Element.Pyro], 0.6),
    );
  });

  test("a transformative reaction its strike triggers takes its creator's party reaction flat base before the enemy's RES", () => {
    expect.hasAssertions();
    const creator = createCombatant({
      ...TRAVELER_KIT,
      getPartyReactionBonus: () => ({ additiveBaseDamageBonus: 100 }),
    });
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(creator, { enemyTables });
    const resistance = kind.elementResistances[Element.Pyro];

    const { transformativeDamage } = priceEnemyReactions(kind, enemy, [swirl], creator, Element.Pyro, context);

    expect(transformativeDamage).toBeCloseTo(
      getTransformativeDamage(TransformativeReactionType.Swirl, LEVEL, 0, resistance) +
        100 * getResistanceMultiplier(resistance),
    );
  });
});
