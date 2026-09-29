import { createSimplexNoise } from "#src/noise/createSimplexNoise";
import { computeTerrainTile } from "#src/terrain/computeTerrainTile";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A tile's cells along a side: the cost must grow with the vertices and nothing else
const BENCH_CELLS_PER_SIDE = [32, 64];
const FINEST_TILE_SIZE = 16;
const key = getTerrainTileKey(2, -3, 5);
const noise = createSimplexNoise(0);
const writeNothing = () => {};
// Flat ground against noise-shaped ground at each size, so `vs base` isolates what sampling heights costs beyond
// Laying the grid, its normals and its coarse positions
describe(computeTerrainTile, () => {
  test.for(BENCH_CELLS_PER_SIDE)("%i cells a side", async (cellsPerSide, { bench }) => {
    await bench.compare(
      bench("flat", () => {
        computeTerrainTile({
          cellsPerSide,
          finestTileSize: FINEST_TILE_SIZE,
          getHeight: () => 0,
          key,
          writeColor: writeNothing,
        });
      }),
      bench("noise", () => {
        computeTerrainTile({
          cellsPerSide,
          finestTileSize: FINEST_TILE_SIZE,
          getHeight: noise,
          key,
          writeColor: writeNothing,
        });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
