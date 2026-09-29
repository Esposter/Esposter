import type { TerrainOptions } from "#src/terrain/TerrainOptions";

import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { selectTerrainTiles } from "#src/terrain/selectTerrainTiles";
import { describe, expect, test } from "vitest";

const terrainOptions: TerrainOptions = {
  cellsPerSide: 2,
  finestRange: 2,
  finestTileSize: 1,
  levelCount: 2,
  maxHeight: 0,
  minHeight: 0,
  morphShare: 0.5,
};

describe(selectTerrainTiles, () => {
  test("draws the finest tile under the eye, coarser tiles farther out, and no tile twice", () => {
    expect.hasAssertions();

    const { count, keys } = selectTerrainTiles(
      terrainOptions,
      { x: 0.5, y: 0, z: 0.5 },
      undefined,
      createTerrainSelection(64),
    );
    const selectedKeys = [...keys.subarray(0, count)];
    const levels = new Set(selectedKeys.map((key) => getTerrainTileLevel(key)));

    expect({
      hasDuplicate: new Set(selectedKeys).size !== count,
      hasFinestUnderEye: selectedKeys.includes(getTerrainTileKey(0, 0, 0)),
      levels: [...levels].toSorted(),
    }).toStrictEqual({ hasDuplicate: false, hasFinestUnderEye: true, levels: [0, 1] });
  });

  test("draws nothing from beyond the coarsest range", () => {
    expect.hasAssertions();

    expect(selectTerrainTiles(terrainOptions, { x: 0, y: 100, z: 0 }, undefined, createTerrainSelection(1)).count).toBe(
      0,
    );
  });
});
