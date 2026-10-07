import type { TerrainOptions } from "#src/models/terrain/TerrainOptions";

import { checkTerrainDrawsChanged } from "#src/terrain/checkTerrainDrawsChanged";
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
};
// The draws all round an eye on the ground and one high above: the cost follows the tiles drawn
const BENCH_EYE_HEIGHTS = [2, 300];
const center = { x: 0, y: 0, z: 0 };
const HALF_SIZE = 80;
// The same draws against draws with their last tile gone, which lies outside the square, so `vs base` shows what a
// Frame something did change costs: the full comparison, with nothing found to stop it early
describe(checkTerrainDrawsChanged, () => {
  test.for(BENCH_EYE_HEIGHTS)("eye %i m up", async (height, { bench }) => {
    const draws = selectTerrainTiles(
      terrainOptions,
      { x: 0, y: height, z: 0 },
      undefined,
      createTerrainSelection(1024),
    );
    const lessLast = { count: draws.count - 1, keys: draws.keys };
    await bench.compare(
      bench("unchanged", () => {
        checkTerrainDrawsChanged(terrainOptions, draws, draws, center, HALF_SIZE);
      }),
      bench("changed outside", () => {
        checkTerrainDrawsChanged(terrainOptions, draws, lessLast, center, HALF_SIZE);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
