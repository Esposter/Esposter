import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { FLOOR } from "#src/services/spiralAbyss/constants.test";
import { defeatAbyssArenaEnemy } from "#src/services/spiralAbyss/defeatAbyssArenaEnemy";
import { enterArenaChamber } from "#src/services/spiralAbyss/enterArenaChamber.test";
import { getAbyssChamberSeconds } from "#src/services/spiralAbyss/getAbyssChamberSeconds";
import { describe, expect, test } from "vitest";

describe(defeatAbyssArenaEnemy, () => {
  test("a half advances when its last enemy is defeated", () => {
    expect.hasAssertions();
    const arena = enterArenaChamber();

    const advanced = defeatAbyssArenaEnemy(arena, arena.camp?.id);

    expect(advanced.challenge).toStrictEqual({
      defeatedHalfCount: 1,
      halfCount: FLOOR.teamCount,
      monolithPercent: undefined,
      secondsLeft: getAbyssChamberSeconds(FLOOR.index),
    });
    expect(advanced.camp?.id).not.toBe(arena.camp?.id);
    expect(advanced.camp?.members.map(({ enemyKindId }) => enemyKindId)).toStrictEqual([EnemyKindId.HilichurlFighter]);
  });

  test("a defeat of an enemy outside the camp in play does not count", () => {
    expect.hasAssertions();
    const arena = enterArenaChamber();

    expect(defeatAbyssArenaEnemy(arena, "other")).toStrictEqual(arena);
  });

  test("the last enemy of the last half clears the chamber and drops its camp", () => {
    expect.hasAssertions();
    const first = enterArenaChamber();
    const lastHalf = defeatAbyssArenaEnemy(first, first.camp?.id);

    const cleared = defeatAbyssArenaEnemy(lastHalf, lastHalf.camp?.id);

    expect(cleared.challenge.defeatedHalfCount).toBe(FLOOR.teamCount);
    expect(cleared.camp).toBeUndefined();
  });
});
