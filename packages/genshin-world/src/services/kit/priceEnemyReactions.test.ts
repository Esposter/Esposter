import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getAmplifyingMultiplier } from "#src/services/combat/damage/getAmplifyingMultiplier";
import { getCatalyzeBonus } from "#src/services/combat/damage/getCatalyzeBonus";
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

describe(priceEnemyReactions, () => {
  const LEVEL = 90;
  const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
  const swirl = { element: Element.Pyro, reactionType: TransformativeReactionType.Swirl };

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

  test("a Swirl's party reaction bonus is read with the element the Swirl absorbed", () => {
    expect.hasAssertions();
    const creator = createCombatant({
      ...TRAVELER_KIT,
      getPartyReactionBonus: (_member, { element }) => (element === Element.Hydro ? { damageBonus: 0.6 } : {}),
    });
    const context = createKitTestContext(creator, { enemyTables });
    const hydroSwirl = { element: Element.Hydro, reactionType: TransformativeReactionType.Swirl };

    const { transformativeDamage: hydroSwirlDamage } = priceEnemyReactions(
      kind,
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      [hydroSwirl],
      creator,
      Element.Anemo,
      context,
    );
    const { transformativeDamage: pyroSwirlDamage } = priceEnemyReactions(
      kind,
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      [swirl],
      creator,
      Element.Anemo,
      context,
    );

    expect(hydroSwirlDamage).toBeCloseTo(
      getTransformativeDamage(TransformativeReactionType.Swirl, LEVEL, 0, kind.elementResistances[Element.Hydro], 0.6),
    );
    expect(pyroSwirlDamage).toBeCloseTo(
      getTransformativeDamage(TransformativeReactionType.Swirl, LEVEL, 0, kind.elementResistances[Element.Pyro]),
    );
  });

  test("a transformative reaction's party reaction bonus is read with the enemy it lands on", () => {
    expect.hasAssertions();
    const markedEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const creator = createCombatant({
      ...TRAVELER_KIT,
      getPartyReactionBonus: (_member, { enemy }) => (enemy === markedEnemy ? { damageBonus: 0.6 } : {}),
    });
    const context = createKitTestContext(creator, { enemyTables });
    const resistance = kind.elementResistances[Element.Pyro];

    const { transformativeDamage: markedDamage } = priceEnemyReactions(
      kind,
      markedEnemy,
      [swirl],
      creator,
      Element.Anemo,
      context,
    );
    const { transformativeDamage: unmarkedDamage } = priceEnemyReactions(
      kind,
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      [swirl],
      creator,
      Element.Anemo,
      context,
    );

    expect(markedDamage).toBeCloseTo(
      getTransformativeDamage(TransformativeReactionType.Swirl, LEVEL, 0, resistance, 0.6),
    );
    expect(unmarkedDamage).toBeCloseTo(getTransformativeDamage(TransformativeReactionType.Swirl, LEVEL, 0, resistance));
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

  test("a Melt its strike triggers takes its creator's party reaction DMG Bonus inside its Elemental Mastery term", () => {
    expect.hasAssertions();
    const elementalMastery = 100;
    const creator = {
      ...createCombatant({ ...TRAVELER_KIT, getPartyReactionBonus: () => ({ damageBonus: 0.6 }) }),
      attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementalMastery }]),
    };
    const context = createKitTestContext(creator, { enemyTables });
    const melt = { element: Element.Pyro, reactionType: AmplifyingReactionType.Melt };

    const { amplifyingMultiplier } = priceEnemyReactions(
      kind,
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      [melt],
      creator,
      Element.Pyro,
      context,
    );

    expect(amplifyingMultiplier).toBeCloseTo(
      getAmplifyingMultiplier(AmplifyingReactionType.Melt, Element.Pyro, elementalMastery, 0.6),
    );
  });

  test("an Aggravate its strike triggers takes its creator's party reaction DMG Bonus inside its Elemental Mastery term", () => {
    expect.hasAssertions();
    const elementalMastery = 100;
    const creator = {
      ...createCombatant({ ...TRAVELER_KIT, getPartyReactionBonus: () => ({ damageBonus: 0.6 }) }),
      attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementalMastery }]),
    };
    const context = createKitTestContext(creator, { enemyTables });
    const aggravate = { element: Element.Electro, reactionType: CatalyzeReactionType.Aggravate };

    const { additiveBaseDamageBonus } = priceEnemyReactions(
      kind,
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      [aggravate],
      creator,
      Element.Electro,
      context,
    );

    expect(additiveBaseDamageBonus).toBeCloseTo(
      getCatalyzeBonus(CatalyzeReactionType.Aggravate, LEVEL, elementalMastery, 0.6),
    );
  });
});
