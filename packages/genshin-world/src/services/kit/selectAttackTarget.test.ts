import type { Enemy } from "#src/models/enemy/Enemy";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitBody } from "#src/models/kit/KitBody";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createEnemyAt = (x: number, z: number): Enemy => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  position: { x, z },
});

describe(selectAttackTarget, () => {
  const BODY: KitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const ZONE: AttackArea = { angle: 2 * Math.PI, height: 6, radius: 5 };

  test("turns to the nearer enemy ahead over a farther one", () => {
    expect.hasAssertions();

    const nearEnemy = createEnemyAt(0, -1);

    expect(selectAttackTarget(ZONE, BODY, [createEnemyAt(0, -4), nearEnemy])).toBe(nearEnemy);
  });

  test("never picks a dead enemy", () => {
    expect.hasAssertions();

    const livingEnemy = createEnemyAt(0, -4);
    const deadEnemy = { ...createEnemyAt(0, -1), state: EnemyState.Dead };

    expect(selectAttackTarget(ZONE, BODY, [deadEnemy, livingEnemy])).toBe(livingEnemy);
  });

  test("picks none when no enemy is within the zone", () => {
    expect.hasAssertions();

    expect(selectAttackTarget(ZONE, BODY, [createEnemyAt(0, -10)])).toBeUndefined();
  });
});
