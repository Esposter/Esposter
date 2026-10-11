import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import {
  SUPERCONDUCT_PHYSICAL_RESISTANCE_REDUCTION,
  SUPERCONDUCT_SECONDS,
  SUPERCONDUCT_STATUS_ID,
} from "#src/services/combat/damage/constants";
import { getAmplifyingMultiplier } from "#src/services/combat/damage/getAmplifyingMultiplier";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { landReactionReach } from "#src/services/kit/landReactionReach";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(landReactionReach, () => {
  const LEVEL = 90;
  const STURDY_HEALTH = 1e9;
  const SPREAD_GAUGE = 2;
  const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: 100 }]),
    characterId: 1,
    constellationCount: 0,
    element: Element.Anemo,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };

  const createSturdyEnemy = (x: number): Enemy => ({
    ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
  });

  const getReactionDamage = (reactionType: TransformativeReactionType, element: Element): number =>
    getTransformativeDamage(reactionType, LEVEL, 0, kind.elementResistances[element]);

  test("deals an Overloaded's damage to each other standing enemy within 3 metres of its edge, and none past them", () => {
    expect.hasAssertions();

    const origin = createSturdyEnemy(0);
    const near = createSturdyEnemy(3.3);
    const far = createSturdyEnemy(3.5);
    const overloaded: TransformativeReaction = {
      element: Element.Pyro,
      reactionType: TransformativeReactionType.Overloaded,
    };

    const enemyStrikeResultMap = landReactionReach(enemyTables, origin, [origin, near, far], overloaded, combatant);

    expect([...enemyStrikeResultMap.keys()]).toStrictEqual([near]);
    expect(near.maxHealth - near.health).toBeCloseTo(
      getReactionDamage(TransformativeReactionType.Overloaded, Element.Pyro),
    );
    expect([origin.health, far.health]).toStrictEqual([STURDY_HEALTH, STURDY_HEALTH]);
  });

  test("takes a Superconduct's 40% off the Physical RES of each enemy it reaches", () => {
    expect.hasAssertions();

    const origin = createSturdyEnemy(0);
    const near = createSturdyEnemy(1);
    const superconduct: TransformativeReaction = {
      element: Element.Cryo,
      reactionType: TransformativeReactionType.Superconduct,
    };

    landReactionReach(enemyTables, origin, [origin, near], superconduct, combatant);

    expect(near.statuses).toStrictEqual([
      {
        damageTakenBonus: 0,
        id: SUPERCONDUCT_STATUS_ID,
        physicalResistanceReduction: SUPERCONDUCT_PHYSICAL_RESISTANCE_REDUCTION,
        secondsRemaining: SUPERCONDUCT_SECONDS,
      },
    ]);
  });

  test.each([
    [Element.Pyro, AuraType.Pyro, true],
    [Element.Hydro, AuraType.Hydro, false],
  ])("spreads a %s Swirl's element at its gauge, dealing its damage: %s", (element, auraType, isDealt) => {
    expect.hasAssertions();

    const origin = createSturdyEnemy(0);
    const near = createSturdyEnemy(4);
    const swirl: TransformativeReaction = {
      element,
      reactionType: TransformativeReactionType.Swirl,
      spreadGauge: SPREAD_GAUGE,
    };

    landReactionReach(enemyTables, origin, [origin, near], swirl, combatant);

    expect(near.elementalState.auras.get(auraType)?.gauge).toBeCloseTo(0.8 * SPREAD_GAUGE);
    expect(near.maxHealth - near.health).toBeCloseTo(
      isDealt ? getReactionDamage(TransformativeReactionType.Swirl, element) : 0,
    );
  });

  test("amplifies a Pyro Swirl's damage by the Vaporize its Pyro triggers, and returns an Overloaded it triggers to reach on", () => {
    expect.hasAssertions();

    const origin = createSturdyEnemy(0);
    const wet = createSturdyEnemy(2);
    const charged = createSturdyEnemy(-2);
    applyElement(wet.elementalState, Element.Hydro, 4);
    applyElement(charged.elementalState, Element.Electro, 1);
    const swirl: TransformativeReaction = {
      element: Element.Pyro,
      reactionType: TransformativeReactionType.Swirl,
      spreadGauge: SPREAD_GAUGE,
    };

    const enemyStrikeResultMap = landReactionReach(enemyTables, origin, [origin, wet, charged], swirl, combatant);

    expect(wet.maxHealth - wet.health).toBeCloseTo(
      getReactionDamage(TransformativeReactionType.Swirl, Element.Pyro) *
        getAmplifyingMultiplier(ReactionType.Vaporize, Element.Pyro, 0),
    );
    expect(enemyStrikeResultMap.get(charged)?.reachingReactions).toStrictEqual([
      { element: Element.Pyro, reactionType: TransformativeReactionType.Overloaded },
    ]);
  });
});
