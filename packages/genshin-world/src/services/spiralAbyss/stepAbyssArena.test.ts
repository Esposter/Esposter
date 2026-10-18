import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyState } from "#src/models/enemy/EnemyState";
import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { spawnAbyssHalf } from "#src/services/spiralAbyss/spawnAbyssHalf";
import { stepAbyssArena } from "#src/services/spiralAbyss/stepAbyssArena";
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
const enemyKindIds = { [DESCRIBE_ID]: EnemyKindId.HilichurlFighter };
const spawnHalf = (halfIndex: number) =>
  spawnAbyssHalf(enemyTables, [], chamber, halfIndex, enemyKindIds, DISC, "abyss-1");
const defeat = (arena: AbyssArena): AbyssArena => ({
  ...arena,
  enemies: arena.enemies.map((enemy) => ({ ...enemy, state: EnemyState.Dead })),
});

describe(stepAbyssArena, () => {
  test("the clock runs while a half's monsters live, and the next half spawns once its last is defeated", () => {
    expect.hasAssertions();
    const firstHalf: AbyssArena = {
      challenge: { defeatedHalfCount: 0, halfCount: 2, secondsLeft: 600 },
      enemies: spawnHalf(0),
    };

    const stepped = stepAbyssArena(firstHalf, 10, spawnHalf);
    expect(stepped.challenge).toStrictEqual({ defeatedHalfCount: 0, halfCount: 2, secondsLeft: 590 });
    expect(stepped.enemies).toHaveLength(1);

    const advanced = stepAbyssArena(defeat(stepped), 0, spawnHalf);
    expect(advanced.challenge.defeatedHalfCount).toBe(1);
    expect(advanced.enemies.map(({ state }) => state)).toStrictEqual([EnemyState.Idle]);
  });

  test("a cleared chamber stops its clock, so its stars keep the seconds left at the clear", () => {
    expect.hasAssertions();
    const lastHalf: AbyssArena = {
      challenge: { defeatedHalfCount: 1, halfCount: 2, secondsLeft: 100 },
      enemies: spawnHalf(1),
    };

    const cleared = stepAbyssArena(defeat(lastHalf), 10, spawnHalf);
    expect(cleared.challenge).toStrictEqual({ defeatedHalfCount: 2, halfCount: 2, secondsLeft: 90 });
    expect(cleared.enemies).toStrictEqual([]);
    expect(stepAbyssArena(cleared, 50, spawnHalf).challenge.secondsLeft).toBe(90);
  });

  test("a chamber whose clock runs out fails and spawns nothing", () => {
    expect.hasAssertions();
    const lowClock: AbyssArena = {
      challenge: { defeatedHalfCount: 0, halfCount: 2, secondsLeft: 5 },
      enemies: spawnHalf(0),
    };

    const failed = stepAbyssArena(lowClock, 10, spawnHalf);
    expect(failed.challenge.secondsLeft).toBe(0);
    expect(failed.enemies).toStrictEqual([]);
  });
});
