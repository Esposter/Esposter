import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import {
  AREA_ID,
  CENTER,
  CHAMBER,
  DESCRIBE_ID,
  ENEMY_KIND_IDS,
  FLOOR,
  STARTED_AT,
  TEAMS,
} from "#src/services/spiralAbyss/constants.test";
import { createAbyssArena } from "#src/services/spiralAbyss/createAbyssArena";
import { getAbyssChamberSeconds } from "#src/services/spiralAbyss/getAbyssChamberSeconds";
import { describe, expect, test } from "vitest";

describe(createAbyssArena, () => {
  test("a chamber is entered with the party set, and the party fights its first half", () => {
    expect.hasAssertions();

    const arena = createAbyssArena(FLOOR, CHAMBER, TEAMS, ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT);

    expect(arena?.camp?.members.map(({ enemyKindId }) => enemyKindId)).toStrictEqual([EnemyKindId.HilichurlFighter]);
    expect(arena?.challenge).toStrictEqual({
      defeatedHalfCount: 0,
      halfCount: FLOOR.teamCount,
      monolithPercent: undefined,
      secondsLeft: getAbyssChamberSeconds(FLOOR.index),
    });
  });

  test("a chamber cannot be entered without a party", () => {
    expect.hasAssertions();

    expect(createAbyssArena(FLOOR, CHAMBER, [], ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT)).toBeUndefined();
  });

  test("a chamber with a half that lists no enemies is not entered", () => {
    expect.hasAssertions();

    const sceneChamber: AbyssChamber = { ...CHAMBER, halfMonsterDescribeIds: [[DESCRIBE_ID], []] };

    expect(createAbyssArena(FLOOR, sceneChamber, TEAMS, ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT)).toBeUndefined();
  });
});
