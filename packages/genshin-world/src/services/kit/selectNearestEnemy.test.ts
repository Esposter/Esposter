import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { selectNearestEnemy } from "#src/services/kit/selectNearestEnemy";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createEnemyAt = (x: number, state = EnemyState.Idle): Enemy => ({
  ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, ""),
  state,
});

describe(selectNearestEnemy, () => {
  const ORIGIN = { x: 0, z: 0 };
  const RADIUS = 10;

  test("takes the standing enemy nearest the point within the radius", () => {
    expect.hasAssertions();
    const nearest = createEnemyAt(1.5);

    expect(selectNearestEnemy(ORIGIN, [createEnemyAt(3), nearest], RADIUS)).toBe(nearest);
  });

  test("takes an enemy up to the radius and its edge, and none beyond", () => {
    expect.hasAssertions();
    const withinEdge = createEnemyAt(RADIUS + ENEMY_CAPSULE_RADIUS - 0.1);

    expect(selectNearestEnemy(ORIGIN, [withinEdge], RADIUS)).toBe(withinEdge);
    expect(selectNearestEnemy(ORIGIN, [createEnemyAt(RADIUS + ENEMY_CAPSULE_RADIUS + 0.1)], RADIUS)).toBeUndefined();
  });

  test("skips a dead or returning enemy however near it stands", () => {
    expect.hasAssertions();
    const standing = createEnemyAt(3);

    expect(
      selectNearestEnemy(
        ORIGIN,
        [createEnemyAt(1, EnemyState.Dead), createEnemyAt(2, EnemyState.Return), standing],
        RADIUS,
      ),
    ).toBe(standing);
  });
});
