import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ENEMY_AGGRO_RANGE } from "#src/services/enemy/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitBody } from "#src/services/kit/createKitBody";
import { createKitTaunt } from "#src/services/kit/effects/createKitTaunt.test";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { stepKitTaunt } from "#src/services/kit/effects/stepKitTaunt";
import { selectEnemyTaunt } from "#src/services/kit/selectEnemyTaunt";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createTaunt = (x: number, health: number): KitTaunt => ({
  ...createKitTaunt(health, 5),
  body: createKitBody({ x, z: 0 }),
});

describe(selectEnemyTaunt, () => {
  test("draws an enemy to the nearest live taunt within its aggro range, and never to one whose health is gone", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.position = { x: 0, z: 0 };
    const nearTaunt = createTaunt(3, 100);
    const spentTaunt = createTaunt(1, 0);
    const outOfRangeTaunt = createTaunt(ENEMY_AGGRO_RANGE + 1, 100);

    expect(selectEnemyTaunt(enemy, [createTaunt(6, 100), spentTaunt, nearTaunt, outOfRangeTaunt])).toBe(nearTaunt);
    expect(selectEnemyTaunt(enemy, [spentTaunt, outOfRangeTaunt])).toBeUndefined();
  });

  test("draws an enemy while the taunt stands, and once its health is struck to zero it explodes and draws none", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.position = { x: 0, z: 0 };
    const taunt = createTaunt(3, 100);
    expect(selectEnemyTaunt(enemy, [taunt])).toBe(taunt);

    damageKitTaunt([], taunt, 100);

    expect(stepKitTaunt(taunt)).toBeDefined();
    expect(selectEnemyTaunt(enemy, [taunt])).toBeUndefined();
  });
});
