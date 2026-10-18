import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyState } from "#src/models/enemy/EnemyState";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { spawnAbyssHalf } from "#src/services/spiralAbyss/spawnAbyssHalf";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// The describe of the Hilichurl Fighter, whose base variant is the kind of that name
const DESCRIBE_ID = 10101;
const DISC = { x: -483.6, z: 719.2 };
const chamber: AbyssChamber = {
  conditions: [],
  halfMonsterDescribeIds: [[DESCRIBE_ID, DESCRIBE_ID], []],
  id: 1,
  index: 1,
  monsterLevel: 24,
};
const enemyKindIds = { [DESCRIBE_ID]: EnemyKindId.HilichurlFighter };

describe(spawnAbyssHalf, () => {
  test("a half's monsters spawn on the entrance's disc at the chamber's monster level", () => {
    expect.hasAssertions();

    expect(
      spawnAbyssHalf(enemyTables, [], chamber, 0, enemyKindIds, DISC, "abyss-1").map(
        ({ enemyKindId, home, level, state }) => ({ enemyKindId, home, level, state }),
      ),
    ).toStrictEqual([
      { enemyKindId: EnemyKindId.HilichurlFighter, home: DISC, level: 24, state: EnemyState.Idle },
      { enemyKindId: EnemyKindId.HilichurlFighter, home: DISC, level: 24, state: EnemyState.Idle },
    ]);
  });

  test("a half with no monsters spawns none", () => {
    expect.hasAssertions();

    expect(spawnAbyssHalf(enemyTables, [], chamber, 1, enemyKindIds, DISC, "abyss-1")).toStrictEqual([]);
  });

  test("a monster whose describe has no kind is refused", () => {
    expect.hasAssertions();

    expect(() => spawnAbyssHalf(enemyTables, [], chamber, 0, {}, DISC, "abyss-1")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 10101, has no enemy kind]`,
    );
  });
});
