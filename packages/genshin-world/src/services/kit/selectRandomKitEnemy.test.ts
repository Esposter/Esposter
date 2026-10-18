import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { selectRandomKitEnemy } from "#src/services/kit/selectRandomKitEnemy";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createEnemyAt = (x: number, z: number): Enemy => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  position: { x, z },
});

describe(selectRandomKitEnemy, () => {
  const CENTRE = { x: 0, z: 0 };

  test("picks the one enemy within the radius, whatever the random source draws", () => {
    expect.hasAssertions();

    const nearEnemy = createEnemyAt(0, -1);

    expect(selectRandomKitEnemy(CENTRE, 2, [createEnemyAt(0, -4), nearEnemy], () => 0.99)).toBe(nearEnemy);
  });

  test("picks among the enemies within the radius by the random source", () => {
    expect.hasAssertions();

    const firstEnemy = createEnemyAt(0, -1);
    const secondEnemy = createEnemyAt(1, 0);
    const enemies = [firstEnemy, secondEnemy];

    expect(selectRandomKitEnemy(CENTRE, 2, enemies, () => 0)).toBe(firstEnemy);
    expect(selectRandomKitEnemy(CENTRE, 2, enemies, () => 0.99)).toBe(secondEnemy);
  });

  test("never picks a dead enemy", () => {
    expect.hasAssertions();

    const livingEnemy = createEnemyAt(0, -1);
    const deadEnemy = { ...createEnemyAt(0, -1), state: EnemyState.Dead };

    expect(selectRandomKitEnemy(CENTRE, 2, [deadEnemy, livingEnemy], () => 0)).toBe(livingEnemy);
  });

  test("picks none when no living enemy is within the radius", () => {
    expect.hasAssertions();

    expect(selectRandomKitEnemy(CENTRE, 2, [createEnemyAt(0, -4)], () => 0)).toBeUndefined();
  });
});
