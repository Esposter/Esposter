import { getParentTerrainTileKey } from "#src/terrain/getParentTerrainTileKey";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { describe, expect, test } from "vitest";

describe(getParentTerrainTileKey, () => {
  test("halves the column and row toward negative infinity, one level up", () => {
    expect.hasAssertions();

    expect(getParentTerrainTileKey(getTerrainTileKey(0, -1, 3))).toBe(getTerrainTileKey(1, -1, 1));
  });
});
