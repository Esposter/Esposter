import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { LUNAR_CONTRIBUTION_WEIGHTS } from "#src/services/combat/damage/constants";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { detonateStellarVortex } from "#src/services/kit/detonateStellarVortex";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const LEVEL = 90;
const BODY = { facing: 0, height: 0, position: { x: 0, z: 0 } };
const STURDY_HEALTH = 1e9;

describe(detonateStellarVortex, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };
  const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
  // Explodes a vortex of the stacks given, with one enemy the distance given from it, and returns that enemy
  const explode = (stacks: number, distance: number) => {
    const enemy = {
      ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x: distance, z: 0 } }, ""),
      health: STURDY_HEALTH,
      maxHealth: STURDY_HEALTH,
    };
    const context = createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]), enemyTables });
    detonateStellarVortex(createKitSummon(BODY, combatant, [], { id: "stellarVortex", stacks }), context);
    return enemy;
  };
  // The one contributor's damage at the coefficient, weighted as the first place is, against the enemy's Cryo RES
  const getExpectedDamage = (coefficient: number, enemy: ReturnType<typeof explode>) =>
    takeOne(CharacterLevelMultiplierMap, LEVEL) *
    coefficient *
    LUNAR_CONTRIBUTION_WEIGHTS[0] *
    getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Cryo));

  test("a Stellar Vortex explodes at a coefficient of 2 for its first two stacks", () => {
    expect.hasAssertions();
    const enemy = explode(2, 3);

    expect(enemy.maxHealth - enemy.health).toBeCloseTo(getExpectedDamage(2, enemy), 6);
  });

  test("a Stellar Vortex explodes at a coefficient of 3 from its third stack", () => {
    expect.hasAssertions();
    const enemy = explode(3, 3);

    expect(enemy.maxHealth - enemy.health).toBeCloseTo(getExpectedDamage(3, enemy), 6);
  });

  test("a vortex's explosion reaches only the enemies within its radius, which its third stack widens", () => {
    expect.hasAssertions();
    const outside = explode(2, 7);
    const widened = explode(3, 7);

    expect(outside.health).toBe(outside.maxHealth);
    expect(widened.health).toBeLessThan(widened.maxHealth);
  });
});
