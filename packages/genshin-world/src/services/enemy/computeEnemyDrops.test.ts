import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyDropFamily } from "#src/models/enemy/EnemyDropFamily";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { computeEnemyDrops } from "#src/services/enemy/computeEnemyDrops";
import { EnemyDropFamilyDropTableMap } from "#src/services/enemy/EnemyDropFamilyDropTableMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(computeEnemyDrops, () => {
  const enemyKind = getEnemyKind(enemyTables.enemyKindMap, EnemyKindId.HilichurlFighter);
  const { materials } = EnemyDropFamilyDropTableMap[EnemyDropFamily.Hilichurls];

  test("drops the least Mora of its band, and a material's fraction as the chance of one more", () => {
    expect.hasAssertions();

    expect(computeEnemyDrops(enemyKind, 1, () => 0)).toStrictEqual({
      characterExperience: 10,
      materials: [{ count: 1, itemId: takeOne(materials).itemId }],
      mora: 14,
    });
    expect(computeEnemyDrops(enemyKind, 1, () => 0.9)).toStrictEqual({
      characterExperience: 10,
      materials: [],
      mora: 20,
    });
  });

  test("drops every tier from the highest band, which holds every level past it", () => {
    expect.hasAssertions();

    expect(computeEnemyDrops(enemyKind, 100, () => 0)).toStrictEqual({
      characterExperience: 20,
      materials: materials.map(({ itemId }) => ({ count: 1, itemId })),
      mora: 32,
    });
  });
});
