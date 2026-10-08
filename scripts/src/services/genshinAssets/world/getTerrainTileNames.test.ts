import { getTerrainTileNames } from "#src/services/genshinAssets/world/getTerrainTileNames";
import { describe, expect, test } from "vitest";

describe(getTerrainTileNames, () => {
  test("names the capital's tile and its east, north and north-east neighbours, as Windrise's ground is", () => {
    expect.hasAssertions();

    expect(getTerrainTileNames({ column: 1, row: -2 })).toStrictEqual([
      "BigWorldTerrain_1_-2.bin",
      "BigWorldTerrain_2_-2.bin",
      "BigWorldTerrain_1_-1.bin",
      "BigWorldTerrain_2_-1.bin",
    ]);
  });
});
