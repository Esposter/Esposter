import type { TerrainTile } from "#src/models/terrain/TerrainTile";

import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { mergeTerrainTiles } from "#src/terrain/mergeTerrainTiles";
import { describe, expect, test } from "vitest";

const FINEST_TILE_SIZE = 16;

// A tile of one vertex, its positions at the tile's corner
const createTerrainTile = (column: number): TerrainTile => ({
  coarseColors: new Float32Array([0.1, 0.2, 0.3]),
  coarseNormals: new Float32Array([0, 1, 0]),
  coarsePositions: new Float32Array([2, 3, 4, 5]),
  colors: new Float32Array([0.4, 0.5, 0.6]),
  key: getTerrainTileKey(0, column, 0),
  normals: new Float32Array([0, 1, 0]),
  positions: new Float32Array([1, 2, 3]),
});

describe(mergeTerrainTiles, () => {
  test("moves each tile's positions to its place and keeps its coarse level", () => {
    expect.hasAssertions();

    const merged = mergeTerrainTiles([createTerrainTile(0), createTerrainTile(1)], FINEST_TILE_SIZE);

    expect(merged.positions).toStrictEqual(new Float32Array([1, 2, 3, 17, 2, 3]));
    expect(merged.coarsePositions).toStrictEqual(new Float32Array([2, 3, 4, 5, 18, 3, 4, 5]));
  });
});
