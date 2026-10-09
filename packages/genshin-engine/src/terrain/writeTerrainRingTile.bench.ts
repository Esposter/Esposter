import type { TerrainTileArrays } from "#src/models/terrain/TerrainTileArrays";

import { computeTerrainTile } from "#src/terrain/computeTerrainTile";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { writeTerrainRingTile } from "#src/terrain/writeTerrainRingTile";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A tile written at each grid into a ring of a few dozen tiles: the cost must follow the tile's vertices, never the
// Ring's size, which a write never walks
const BENCH_RING_TILE_COUNTS = [8, 64];
const COARSE_CELLS_PER_SIDE = 32;
const FINE_CELLS_PER_SIDE = 64;
const FINEST_TILE_SIZE = 16;
const LEVEL = 3;
const writeNothing = () => {};
const createTile = (cellsPerSide: number) =>
  computeTerrainTile({
    cellsPerSide,
    finestTileSize: FINEST_TILE_SIZE,
    getHeight: () => 0,
    key: getTerrainTileKey(LEVEL, 1, 1),
    writeColor: writeNothing,
  });
const createRing = (vertexCount: number): TerrainTileArrays => ({
  coarseColors: new Float32Array(vertexCount * 3),
  coarseNormals: new Float32Array(vertexCount * 3),
  coarsePositions: new Float32Array(vertexCount * 4),
  colors: new Float32Array(vertexCount * 3),
  normals: new Float32Array(vertexCount * 3),
  positions: new Float32Array(vertexCount * 3),
});
const coarseTile = createTile(COARSE_CELLS_PER_SIDE);
const fineTile = createTile(FINE_CELLS_PER_SIDE);
const coarseVertexCount = (COARSE_CELLS_PER_SIDE + 1) ** 2;
const fineVertexCount = (FINE_CELLS_PER_SIDE + 1) ** 2;
// One test per ring size, the grids compared within it. Each write lands in the ring's last slot, which it overwrites
describe(writeTerrainRingTile, () => {
  test.for(BENCH_RING_TILE_COUNTS)("a ring of %i tiles", async (ringTileCount, { bench }) => {
    const coarseRing = createRing(ringTileCount * coarseVertexCount);
    const fineRing = createRing(ringTileCount * fineVertexCount);
    await bench.compare(
      bench(`${COARSE_CELLS_PER_SIDE} cells a side`, () => {
        writeTerrainRingTile(coarseRing, (ringTileCount - 1) * coarseVertexCount, coarseTile, FINEST_TILE_SIZE);
      }),
      bench(`${FINE_CELLS_PER_SIDE} cells a side`, () => {
        writeTerrainRingTile(fineRing, (ringTileCount - 1) * fineVertexCount, fineTile, FINEST_TILE_SIZE);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
