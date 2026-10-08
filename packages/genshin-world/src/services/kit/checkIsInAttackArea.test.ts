import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitBody } from "#src/models/kit/KitBody";

import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { describe, expect, test } from "vitest";

const BODY: KitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
const AREA = { angle: Math.PI / 2, height: 2, radius: 3 };

const createEnemyAt = (x: number, z: number): Enemy => ({ ...createEnemy(ENEMY_CAMP_MEMBER, ""), position: { x, z } });

describe(checkIsInAttackArea, () => {
  test("reaches an enemy ahead of the body within its radius", () => {
    expect.hasAssertions();

    expect(checkIsInAttackArea(AREA, BODY, createEnemyAt(0, -2))).toBe(true);
  });

  test("misses an enemy behind the body or beyond its radius", () => {
    expect.hasAssertions();

    expect(checkIsInAttackArea(AREA, BODY, createEnemyAt(0, 2))).toBe(false);
    expect(checkIsInAttackArea(AREA, BODY, createEnemyAt(0, -4))).toBe(false);
  });

  test("misses an enemy the height of the area does not reach", () => {
    expect.hasAssertions();

    expect(checkIsInAttackArea(AREA, { ...BODY, height: 3 }, createEnemyAt(0, -2))).toBe(false);
  });
});
