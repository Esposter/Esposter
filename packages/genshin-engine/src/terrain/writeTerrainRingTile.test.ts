import type { TerrainTile } from "#src/models/terrain/TerrainTile";
import type { TerrainTileArrays } from "#src/models/terrain/TerrainTileArrays";

import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { writeTerrainRingTile } from "#src/terrain/writeTerrainRingTile";
import { describe, expect, test } from "vitest";

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
// A ring of two vertices, one a tile
const createRing = (): TerrainTileArrays => ({
  coarseColors: new Float32Array(6),
  coarseNormals: new Float32Array(6),
  coarsePositions: new Float32Array(8),
  colors: new Float32Array(6),
  normals: new Float32Array(6),
  positions: new Float32Array(6),
});

describe(writeTerrainRingTile, () => {
  const FINEST_TILE_SIZE = 16;

  test("moves the tile's positions to its place from its base on and keeps its coarse level", () => {
    expect.hasAssertions();

    const ring = createRing();
    writeTerrainRingTile(ring, 1, createTerrainTile(1), FINEST_TILE_SIZE);

    expect(ring.positions).toStrictEqual(new Float32Array([0, 0, 0, 17, 2, 3]));
    expect(ring.coarsePositions).toStrictEqual(new Float32Array([0, 0, 0, 0, 18, 3, 4, 5]));
    expect(ring.colors).toStrictEqual(new Float32Array([0, 0, 0, 0.4, 0.5, 0.6]));
  });
});
