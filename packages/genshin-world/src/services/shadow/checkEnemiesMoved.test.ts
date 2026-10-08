import type { Enemy } from "#src/models/enemy/Enemy";

import { CASTER_REDRAW_ANGLE, CASTER_REDRAW_DISTANCE } from "#src/services/constants";
import { checkEnemiesMoved } from "#src/services/shadow/checkEnemiesMoved";
import { writeEnemyPoses } from "#src/services/shadow/writeEnemyPoses";
import { describe, expect, test } from "vitest";

type EnemyPose = Pick<Enemy, "heading" | "position">;

const ENEMY_ID = "enemy";
const createEnemyPose = (): EnemyPose => ({ heading: 0, position: { x: 1, z: 2 } });

describe(checkEnemiesMoved, () => {
  test("keeps the poses the enemies were drawn at", () => {
    expect.hasAssertions();

    const enemyMap = new Map([[ENEMY_ID, createEnemyPose()]]);
    const enemyPoses: number[] = [];
    writeEnemyPoses(enemyMap, enemyPoses);

    expect(checkEnemiesMoved(enemyMap, enemyPoses)).toBe(false);
  });

  test("keeps an enemy that has stepped less than the redraw distance", () => {
    expect.hasAssertions();

    const enemyPose = createEnemyPose();
    const enemyMap = new Map([[ENEMY_ID, enemyPose]]);
    const enemyPoses: number[] = [];
    writeEnemyPoses(enemyMap, enemyPoses);

    enemyPose.position.x += CASTER_REDRAW_DISTANCE / 2;
    expect(checkEnemiesMoved(enemyMap, enemyPoses)).toBe(false);
  });

  test("redraws once an enemy has walked or turned past its threshold, or a camp has been spawned or removed", () => {
    expect.hasAssertions();

    const enemyPose = createEnemyPose();
    const enemyMap = new Map([[ENEMY_ID, enemyPose]]);
    const enemyPoses: number[] = [];
    writeEnemyPoses(enemyMap, enemyPoses);

    enemyPose.position.x += CASTER_REDRAW_DISTANCE * 2;
    expect(checkEnemiesMoved(enemyMap, enemyPoses)).toBe(true);

    enemyPose.position.x -= CASTER_REDRAW_DISTANCE * 2;
    enemyPose.heading = CASTER_REDRAW_ANGLE * 2;
    expect(checkEnemiesMoved(enemyMap, enemyPoses)).toBe(true);

    enemyPose.heading = 0;
    expect(checkEnemiesMoved(new Map(), enemyPoses)).toBe(true);
  });
});
