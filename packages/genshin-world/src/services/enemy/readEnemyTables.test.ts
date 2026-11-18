import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { FAMILYLESS_ENEMY_KIND_IDS } from "#src/models/enemy/EnemyKindId";
import { EnemyType } from "#src/models/enemy/EnemyType";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { describe, expect, test } from "vitest";

describe(readEnemyTables, () => {
  // A non-boss kind with no drop table drops only its Character EXP, so the familyless list must name exactly those kinds of
  // The pinned record, and the read refuses any other kind with no table
  test("the kinds with no drop table are the familyless list's", async () => {
    expect.hasAssertions();

    const { enemyDropTableMap, enemyKindMap } = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
    const kindIdsWithoutDropTable = [...enemyKindMap.values()]
      .filter(({ enemyType, id }) => enemyType !== EnemyType.Boss && !enemyDropTableMap.has(id))
      .map(({ id }) => id)
      .toSorted((firstId, secondId) => firstId - secondId);

    expect(kindIdsWithoutDropTable).toStrictEqual(
      [...FAMILYLESS_ENEMY_KIND_IDS].toSorted((firstId, secondId) => firstId - secondId),
    );
  });
});
