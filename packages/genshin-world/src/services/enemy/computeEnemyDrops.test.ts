import type { EnemyDropTable } from "#src/models/enemy/EnemyDropTable";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { computeEnemyDrops } from "#src/services/enemy/computeEnemyDrops";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(computeEnemyDrops, () => {
  const enemyKind = getEnemyKind(enemyTables.enemyKindMap, EnemyKindId.HilichurlFighter);
  // The Hilichurls' drop table, as the wiki's Enemies table gives it
  const dropTable: EnemyDropTable = {
    materials: [
      { expectedCount: 0.4202, itemId: 112005, tier: 0 },
      { expectedCount: 0.112, itemId: 112006, tier: 1 },
      { expectedCount: 0.028, itemId: 112007, tier: 2 },
    ],
    mora: 32,
  };
  const { materials } = dropTable;

  test("a defeated common enemy drops its family's Mora and materials", () => {
    expect.hasAssertions();

    expect(computeEnemyDrops(enemyKind, dropTable, 1, () => 0)).toStrictEqual({
      characterExperience: 10,
      materials: [{ count: 1, itemId: takeOne(materials).itemId }],
      mora: 14,
    });
    expect(computeEnemyDrops(enemyKind, dropTable, 1, () => 0.9)).toStrictEqual({
      characterExperience: 10,
      materials: [],
      mora: 20,
    });
  });

  test("drops every tier from the highest band, which holds every level past it", () => {
    expect.hasAssertions();

    expect(computeEnemyDrops(enemyKind, dropTable, 100, () => 0)).toStrictEqual({
      characterExperience: 20,
      materials: materials.map(({ itemId }) => ({ count: 1, itemId })),
      mora: 32,
    });
  });

  test("a defeated enemy with no drop family drops no Mora or materials", () => {
    expect.hasAssertions();
    // A kind on the familyless list, whose wiki article names no Drops Table, so the reader gives it no drop table
    const erodingAvatar = getEnemyKind(enemyTables.enemyKindMap, EnemyKindId.ErodingAvatarOfLava);

    expect(computeEnemyDrops(erodingAvatar, undefined, 1, () => 0)).toStrictEqual({
      characterExperience: 10,
      materials: [],
      mora: 0,
    });
  });
});
