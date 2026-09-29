import type { TerrainOptions } from "#src/terrain/TerrainOptions";

import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { resolveTerrainDraws } from "#src/terrain/resolveTerrainDraws";
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
// The views of an eye on the ground and one high above: the cost follows the tiles wanted
const BENCH_EYE_HEIGHTS = [2, 300];
const draws = createTerrainSelection(1024);
const checkCoarsestLoaded = (key: number) => getTerrainTileLevel(key) === terrainOptions.levelCount - 1;
// Every tile arrived against only the coarsest level, where each falls back to its root ancestor, so `vs base` shows
// What streaming costs
describe(resolveTerrainDraws, () => {
  test.for(BENCH_EYE_HEIGHTS)("eye %i m up", async (height, { bench }) => {
    const wanted = selectTerrainTiles(
      terrainOptions,
      { x: 0, y: height, z: 0 },
      undefined,
      createTerrainSelection(1024),
    );
    await bench.compare(
      bench("all arrived", () => {
        resolveTerrainDraws(terrainOptions, wanted, () => true, draws);
      }),
      bench("coarsest arrived", () => {
        resolveTerrainDraws(terrainOptions, wanted, checkCoarsestLoaded, draws);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
