import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { getLunarDamage } from "#src/services/combat/damage/getLunarDamage";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeMoondriftHarmonyHits } from "#src/services/kit/strikeMoondriftHarmonyHits";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(strikeMoondriftHarmonyHits, () => {
  const LEVEL = 90;
  const STURDY_HEALTH = 1e9;
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
  const createHitEnemy = (): Enemy => ({
    ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
    moondriftHarmonyHits: [
      { contributorIds: new Set([combatant.characterId]), ownerId: combatant.characterId, secondsRemaining: 0.3 },
    ],
  });
  const createContext = (enemy: Enemy): KitContext =>
    createKitTestContext(combatant, { enemyMap: new Map([["", enemy]]), enemyTables });

  test("lands a hit once its seconds run out, as Lunar-Crystallize's against Geo RES", () => {
    expect.hasAssertions();

    const enemy = createHitEnemy();
    const context = createContext(enemy);
    strikeMoondriftHarmonyHits(0.2, context);
    const healthBefore = enemy.health;
    strikeMoondriftHarmonyHits(0.2, context);

    expect(healthBefore).toBe(STURDY_HEALTH);
    expect(STURDY_HEALTH - enemy.health).toBeCloseTo(
      0.6 *
        getLunarDamage(LunarReactionType.LunarCrystallize, takeOne(CharacterLevelMultiplierMap, LEVEL), 0, 0, 0) *
        getResistanceMultiplier(kind.elementResistances[Element.Geo]),
    );
    expect(enemy.moondriftHarmonyHits).toStrictEqual([]);
  });

  test("drops the hits on their way to an enemy no longer standing", () => {
    expect.hasAssertions();

    const enemy: Enemy = { ...createHitEnemy(), state: EnemyState.Dead };
    strikeMoondriftHarmonyHits(1, createContext(enemy));

    expect([enemy.health, enemy.moondriftHarmonyHits]).toStrictEqual([STURDY_HEALTH, []]);
  });

  test("lands a hit on the step its seconds run out, not one step late", () => {
    expect.hasAssertions();

    const enemy: Enemy = {
      ...createHitEnemy(),
      moondriftHarmonyHits: [
        { contributorIds: new Set([combatant.characterId]), ownerId: combatant.characterId, secondsRemaining: 5 },
      ],
    };
    const context = createContext(enemy);
    for (let step = 0; step < 300; step++) strikeMoondriftHarmonyHits(FIXED_STEP_SECONDS, context);

    expect(enemy.moondriftHarmonyHits).toStrictEqual([]);
  });
});
