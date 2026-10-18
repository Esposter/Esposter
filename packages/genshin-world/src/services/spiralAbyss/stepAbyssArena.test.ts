import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { createAbyssArena } from "#src/services/spiralAbyss/createAbyssArena";
import { stepAbyssArena } from "#src/services/spiralAbyss/stepAbyssArena";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const AREA_ID = "area";
const CENTER = { x: 0, z: 0 };
const DESCRIBE_ID = 10101;
const ENEMY_KIND_IDS = { [DESCRIBE_ID]: EnemyKindId.HilichurlFighter };
const MONSTER_LEVEL = 24;
const STARTED_AT = 0;
const STEP_SECONDS = 10;
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

const enterChamber = (): AbyssArena => {
  const arena = createAbyssArena(floor, chamber, teams, ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT);
  if (!arena) throw new InvalidOperationError(Operation.Read, enterChamber.name, `chamber ${chamber.id}`);
  return arena;
};

describe(stepAbyssArena, () => {
  test("the clock runs down while the chamber is fought", () => {
    expect.hasAssertions();
    const arena = enterChamber();

    expect(stepAbyssArena(arena, STEP_SECONDS).challenge.secondsLeft).toBe(arena.challenge.secondsLeft - STEP_SECONDS);
  });

  test("a chamber not cleared before its clock runs out fails and awards no stars", () => {
    expect.hasAssertions();
    const arena = enterChamber();

    expect(stepAbyssArena(arena, arena.challenge.secondsLeft)).toStrictEqual({
      ...arena,
      camp: undefined,
      challenge: { ...arena.challenge, secondsLeft: 0 },
    });
  });

  test("clearing a chamber with time left earns its stars, and its clock stops at the clear", () => {
    expect.hasAssertions();
    const cleared: AbyssArena = {
      ...enterChamber(),
      camp: undefined,
      challenge: { defeatedHalfCount: floor.teamCount, halfCount: floor.teamCount, secondsLeft: 90 },
    };

    expect(stepAbyssArena(cleared, STEP_SECONDS)).toStrictEqual(cleared);
  });
});
