import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { createAbyssArena } from "#src/services/spiralAbyss/createAbyssArena";
import { getAbyssChamberSeconds } from "#src/services/spiralAbyss/getAbyssChamberSeconds";
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

describe(createAbyssArena, () => {
  test("a chamber is entered with the party set, and the party fights its first half", () => {
    expect.hasAssertions();

    const arena = createAbyssArena(floor, chamber, teams, ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT);

    expect(arena?.camp?.members.map(({ enemyKindId }) => enemyKindId)).toStrictEqual([EnemyKindId.HilichurlFighter]);
    expect(arena?.challenge).toStrictEqual({
      monolithPercent: undefined,
      defeatedHalfCount: 0,
      halfCount: floor.teamCount,
      secondsLeft: getAbyssChamberSeconds(floor.index),
    });
  });

  test("a chamber cannot be entered without a party", () => {
    expect.hasAssertions();

    expect(createAbyssArena(floor, chamber, [], ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT)).toBeUndefined();
  });

  test("a chamber with a half that lists no enemies is not entered", () => {
    expect.hasAssertions();

    const sceneChamber: AbyssChamber = { ...chamber, halfMonsterDescribeIds: [[DESCRIBE_ID], []] };

    expect(createAbyssArena(floor, sceneChamber, teams, ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT)).toBeUndefined();
  });
});
