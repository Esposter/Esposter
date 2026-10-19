import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createPruneKitBehaviour, PRUNE_CHARACTER_ID } from "#src/services/kit/characters/pruneKit";
import { castKitAction, createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const PRUNE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, PRUNE_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createEnemyAt = (x: number): Enemy =>
  createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, "");

const checkIsSummon = (effect: KitEffect): effect is KitSummon => effect.kind === "summon";

describe(createPruneKitBehaviour, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
    characterId: PRUNE_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: PRUNE_KIT,
    level: 90,
    weaponType: WeaponType.Catalyst,
  };
  // The Witchlure Bell's first tick, 137 frames after the cast (burst.go:56), stepped past at the world's fixed step
  const AFTER_FIRST_TICK_SECONDS = 140 / 60;
  const BEFORE_FIRST_TICK_SECONDS = 130 / 60;

  // The summons the bell's ticks have cast, each landing its DoT on the one enemy it was cast on
  const castBellTicks = (enemies: Enemy[], seconds: number): KitSummon[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    castKitAction(PRUNE_KIT.elementalBurst, combatant, kitEffectState);
    const context = createKitTestContext(combatant, {
      enemyMap: new Map(enemies.map((enemy) => [enemy.id, enemy])),
      kitEffectState,
    });
    stepKitSeconds(context, seconds);
    return kitEffectState.effects.filter((effect) => checkIsSummon(effect));
  };

  test("the bell's first tick lands its DoT on the enemy nearest Prune within 10 metres", () => {
    expect.hasAssertions();
    const nearest = createEnemyAt(3);

    expect(
      castBellTicks([createEnemyAt(6), nearest], AFTER_FIRST_TICK_SECONDS).map(
        ({ attackTag, nextHitIndex, target }) => ({ attackTag, nextHitIndex, target }),
      ),
    ).toStrictEqual([{ attackTag: AttackTag.ElementalBurst, nextHitIndex: 1, target: nearest }]);
  });

  test("the bell's tick lands nothing while no enemy stands within 10 metres", () => {
    expect.hasAssertions();

    expect(castBellTicks([createEnemyAt(12)], AFTER_FIRST_TICK_SECONDS)).toStrictEqual([]);
    expect(castBellTicks([createEnemyAt(3)], BEFORE_FIRST_TICK_SECONDS)).toStrictEqual([]);
  });
});
