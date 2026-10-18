import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { createAbyssArena } from "#src/services/spiralAbyss/createAbyssArena";
import { defeatAbyssArenaEnemy } from "#src/services/spiralAbyss/defeatAbyssArenaEnemy";
import { getAbyssChamberSeconds } from "#src/services/spiralAbyss/getAbyssChamberSeconds";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const AREA_ID = "area";
const CENTER = { x: 0, z: 0 };
const DESCRIBE_ID = 10101;
const ENEMY_KIND_IDS = { [DESCRIBE_ID]: EnemyKindId.HilichurlFighter };
const MONSTER_LEVEL = 24;
const STARTED_AT = 0;
const chamber: AbyssChamber = {
  conditions: [],
  halfMonsterDescribeIds: [[DESCRIBE_ID], [DESCRIBE_ID]],
  id: 1,
  index: 1,
  monsterLevel: MONSTER_LEVEL,
};
const floor: AbyssFloor = { chambers: [chamber], id: 1001, index: 1, teamCount: 2, unlockStarCount: 0 };
const teams = [
  { characterIds: [1], name: "a" },
  { characterIds: [2], name: "b" },
];

// The arena a chamber with its party set starts, which every scenario here takes as entered
const enterChamber = (): AbyssArena => {
  const arena = createAbyssArena(floor, chamber, teams, ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT);
  if (!arena) throw new InvalidOperationError(Operation.Read, enterChamber.name, `chamber ${chamber.id}`);
  return arena;
};

describe(defeatAbyssArenaEnemy, () => {
  test("a half advances when its last enemy is defeated", () => {
    expect.hasAssertions();
    const arena = enterChamber();

    const advanced = defeatAbyssArenaEnemy(arena, arena.camp?.id);

    expect(advanced.challenge).toStrictEqual({
      monolithPercent: undefined,
      defeatedHalfCount: 1,
      halfCount: floor.teamCount,
      secondsLeft: getAbyssChamberSeconds(floor.index),
    });
    expect(advanced.camp?.id).not.toBe(arena.camp?.id);
    expect(advanced.camp?.members.map(({ enemyKindId }) => enemyKindId)).toStrictEqual([EnemyKindId.HilichurlFighter]);
  });

  test("a defeat of an enemy outside the camp in play does not count", () => {
    expect.hasAssertions();
    const arena = enterChamber();

    expect(defeatAbyssArenaEnemy(arena, "other")).toStrictEqual(arena);
  });

  test("the last enemy of the last half clears the chamber and drops its camp", () => {
    expect.hasAssertions();
    const first = enterChamber();
    const lastHalf = defeatAbyssArenaEnemy(first, first.camp?.id);

    const cleared = defeatAbyssArenaEnemy(lastHalf, lastHalf.camp?.id);

    expect(cleared.challenge.defeatedHalfCount).toBe(floor.teamCount);
    expect(cleared.camp).toBeUndefined();
  });
});
