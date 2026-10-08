import type { TerrainTile } from "#src/models/terrain/TerrainTile";

import { computeTerrainTile } from "#src/terrain/computeTerrainTile";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { mergeTerrainTiles } from "#src/terrain/mergeTerrainTiles";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A ring's tiles: the cost must grow with the vertices it copies, and nothing else
const BENCH_TILE_COUNTS = [8, 64];
const COARSE_CELLS_PER_SIDE = 32;
const FINE_CELLS_PER_SIDE = 64;
const FINEST_TILE_SIZE = 16;
const LEVEL = 1;
const writeNothing = () => {};
// One level's tiles, each at its own column so the merge moves every tile to a place of its own
const createRing = (tileCount: number, cellsPerSide: number): TerrainTile[] =>
  Array.from({ length: tileCount }, (_value, column) =>
    computeTerrainTile({
      cellsPerSide,
      finestTileSize: FINEST_TILE_SIZE,
      getHeight: () => 0,
      key: getTerrainTileKey(LEVEL, column, 0),
      writeColor: writeNothing,
    }),
  );
// A ring at each grid at each tile count, one test per count so `vs base` compares only the grids
describe(mergeTerrainTiles, () => {
  test.for(BENCH_TILE_COUNTS)("%i tiles", async (tileCount, { bench }) => {
    const coarseRing = createRing(tileCount, COARSE_CELLS_PER_SIDE);
    const fineRing = createRing(tileCount, FINE_CELLS_PER_SIDE);
    await bench.compare(
      bench(`${COARSE_CELLS_PER_SIDE} cells a side`, () => {
        mergeTerrainTiles(coarseRing, FINEST_TILE_SIZE);
      }),
      bench(`${FINE_CELLS_PER_SIDE} cells a side`, () => {
        mergeTerrainTiles(fineRing, FINEST_TILE_SIZE);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
