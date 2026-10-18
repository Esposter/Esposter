import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
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
import { landReactionReach } from "#src/services/kit/landReactionReach";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

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

  test("deals a Bloom's damage with the reaction DMG bonus the kit of the combatant that burst it gives", () => {
    expect.hasAssertions();

    const origin = createSturdyEnemy(0);
    const near = createSturdyEnemy(3);
    const blooming: Combatant = { ...combatant, kit: { ...TRAVELER_KIT, getReactionDamageBonus: () => 0.6 } };
    const bloom: TransformativeReaction = { element: Element.Dendro, reactionType: TransformativeReactionType.Bloom };

    landReactionReach(enemyTables, origin, [origin, near], bloom, blooming);

    expect(near.maxHealth - near.health).toBeCloseTo(
      getTransformativeDamage(TransformativeReactionType.Bloom, LEVEL, 0, kind.elementResistances[Element.Dendro], 0.6),
    );
  });

  test("strikes each enemy an Overloaded reaches with the explosion's poise as a blunt hit, which shatters a Freeze", () => {
    expect.hasAssertions();

    const origin = createSturdyEnemy(0);
    const near = createSturdyEnemy(1);
    const frozen = createSturdyEnemy(2);
    frozen.elementalState.auras.set(AuraType.Freeze, { decayRate: 0, gauge: 1, isImmutable: false });
    const overloaded: TransformativeReaction = {
      element: Element.Pyro,
      reactionType: TransformativeReactionType.Overloaded,
    };

    const enemyStrikeResultMap = landReactionReach(enemyTables, origin, [origin, near, frozen], overloaded, combatant);

    expect([near.state, near.poise]).toStrictEqual([EnemyState.Stagger, 0]);
    expect(frozen.elementalState.auras.has(AuraType.Freeze)).toBe(false);
    expect(enemyStrikeResultMap.get(frozen)?.reactions).toStrictEqual([{ reactionType: ReactionType.Shattered }]);
  });

  test("applies a Burning tick's Pyro to an enemy it reaches under that enemy's own Burning internal cooldown", () => {
    expect.hasAssertions();

    const origin = createSturdyEnemy(0);
    const near = createSturdyEnemy(1);
    const burningTick: TransformativeReaction = {
      element: Element.Pyro,
      reactionType: TransformativeReactionType.Burning,
      spreadGauge: 0,
    };

    landReactionReach(enemyTables, origin, [origin, near], burningTick, combatant);
    const pyroGauge = near.elementalState.auras.get(AuraType.Pyro)?.gauge;
    landReactionReach(enemyTables, origin, [origin, near], burningTick, combatant);

    expect(pyroGauge).toBeGreaterThan(0);
    expect(near.elementalState.auras.get(AuraType.Pyro)?.gauge).toBe(pyroGauge);
    expect(near.maxHealth - near.health).toBeCloseTo(
      2 * getReactionDamage(TransformativeReactionType.Burning, Element.Pyro),
    );
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

  test("arcs an Electro-Charged to the nearest Wet enemy within 5 metres alone, dealing its damage and applying nothing", () => {
    expect.hasAssertions();

    const origin = createSturdyEnemy(0);
    const dry = createSturdyEnemy(1);
    const wet = createSturdyEnemy(2);
    const fartherWet = createSturdyEnemy(-3);
    for (const enemy of [wet, fartherWet]) applyElement(enemy.elementalState, Element.Hydro, 1);
    const electroCharged: TransformativeReaction = {
      element: Element.Electro,
      reactionType: TransformativeReactionType.ElectroCharged,
    };

    const enemyStrikeResultMap = landReactionReach(
      enemyTables,
      origin,
      [origin, dry, wet, fartherWet],
      electroCharged,
      combatant,
    );

    expect([...enemyStrikeResultMap.keys()]).toStrictEqual([wet]);
    expect(wet.maxHealth - wet.health).toBeCloseTo(
      getReactionDamage(TransformativeReactionType.ElectroCharged, Element.Electro),
    );
    expect([...wet.elementalState.auras.keys()]).toStrictEqual([AuraType.Hydro]);
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
