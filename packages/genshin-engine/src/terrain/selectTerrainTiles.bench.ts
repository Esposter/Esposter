import type { TerrainOptions } from "#src/terrain/TerrainOptions";

import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { selectTerrainTiles } from "#src/terrain/selectTerrainTiles";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const terrainOptions: TerrainOptions = {
  cellsPerSide: 32,
  finestRange: 48,
  finestTileSize: 16,
  levelCount: 6,
  maxHeight: 60,
  minHeight: -10,
  morphShare: 0.3,
};
// Standing on the ground and flying high above it: the cost follows the tiles in view, which a high eye has fewer
// Fine ones of, and never the size of the world, which nothing here bounds
const BENCH_EYE_HEIGHTS = [2, 300];
const selection = createTerrainSelection(1024);
// Near the origin against thousands of metres out, so `vs base` shows the world's size costs nothing
describe(selectTerrainTiles, () => {
  test.for(BENCH_EYE_HEIGHTS)("eye %i m up", async (height, { bench }) => {
    await bench.compare(
      bench("near the origin", () => {
        selectTerrainTiles(terrainOptions, { x: 0, y: height, z: 0 }, undefined, selection);
      }),
      bench("far from the origin", () => {
        selectTerrainTiles(terrainOptions, { x: 50_000, y: height, z: -50_000 }, undefined, selection);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
