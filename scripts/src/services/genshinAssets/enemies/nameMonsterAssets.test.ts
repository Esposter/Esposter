import type { MonsterAssetRow } from "#src/models/genshinAssets/enemies/MonsterAssetRow";

import { nameMonsterAssets } from "#src/services/genshinAssets/enemies/nameMonsterAssets";
import { getPathHashKey } from "#src/services/genshinAssets/world/getPathHashKey";
import { describe, expect, test } from "vitest";

describe(nameMonsterAssets, () => {
  test("a placed kind's prefab is named from its monster row", () => {
    expect.hasAssertions();

    const prefabPathHash = "2956196180941222287";
    const prefabPath = "ART/Char/Monster/Monster_Hili_None_01/Monster_Hili_None_01";
    const row: MonsterAssetRow = { id: 21010101, monsterName: "Hili_None_01", prefabPathHash };
    const pathNames = new Map([[getPathHashKey(prefabPathHash), prefabPath]]);

    expect(nameMonsterAssets(row, pathNames)).toStrictEqual({
      combatConfig: undefined,
      controller: undefined,
      prefab: prefabPath,
      unnamed: 0,
    });
  });

  test("a hash the index cannot name is counted", () => {
    expect.hasAssertions();

    const prefabPathHash = "2956196180941222287";
    const prefabPath = "ART/Char/Monster/Monster_Hili_None_01/Monster_Hili_None_01";
    const controllerPathHash = "13507751526928566456";
    const row: MonsterAssetRow = { controllerPathHash, id: 21010101, monsterName: "Hili_None_01", prefabPathHash };
    const pathNames = new Map([[getPathHashKey(prefabPathHash), prefabPath]]);

    expect(nameMonsterAssets(row, pathNames)).toStrictEqual({
      combatConfig: undefined,
      controller: undefined,
      prefab: prefabPath,
      unnamed: 1,
    });
  });
});
