import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createAbyssArena } from "#src/services/spiralAbyss/createAbyssArena";
import { spawnAbyssHalf } from "#src/services/spiralAbyss/spawnAbyssHalf";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const DESCRIBE_ID = 10101;
const DISC = { x: -483.6, z: 719.2 };
const chamber: AbyssChamber = {
  conditions: [],
  halfMonsterDescribeIds: [[DESCRIBE_ID], [DESCRIBE_ID]],
  id: 1,
  index: 1,
  monsterLevel: 24,
};
const floor: AbyssFloor = { chambers: [chamber], id: 1001, index: 1, teamCount: 2, unlockStarCount: 0 };
const enemyKindIds = { [DESCRIBE_ID]: EnemyKindId.HilichurlFighter };
const spawnHalf = (halfIndex: number) =>
  spawnAbyssHalf(enemyTables, [], chamber, halfIndex, enemyKindIds, DISC, "abyss-1");

describe(createAbyssArena, () => {
  test("a chamber starts on its first half's monsters, on the disc", () => {
    expect.hasAssertions();

    const arena = createAbyssArena(
      floor,
      chamber,
      [
        { characterIds: [1], name: "a" },
        { characterIds: [2], name: "b" },
      ],
      spawnHalf,
    );
    expect(arena?.challenge.defeatedHalfCount).toBe(0);
    expect(arena?.enemies).toHaveLength(1);
  });

  test("a party set that is not one team per half has no arena", () => {
    expect.hasAssertions();

    expect(createAbyssArena(floor, chamber, [{ characterIds: [1], name: "a" }], spawnHalf)).toBeUndefined();
  });
});
