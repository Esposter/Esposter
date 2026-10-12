import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";
import type { TerrainShape } from "#src/models/terrain/TerrainShape";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { createTerrainShapeHeight } from "#src/terrain/createTerrainShapeHeight";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A finest tile's padded vertices at the world's resolution: 32 cells over 16 metres, two vertices past each side
const SIDE = 37;
const STEP = 0.5;
// The hills a vertex of Windrise's fitted ground reads on average, at the fit's widths
const HILL_COUNT = 76;
const HILL_WIDTHS = [200, 120, 70, 40, 24, 14];
// As many more hills or features, enough that the time they add stands clear of a run's noise
const ADDED_COUNT = 28;
// Every hill and feature reaches the tile round the origin, so each vertex reads them all
const createHills = (count: number) =>
  Array.from({ length: count }, (_value, index) => {
    const width = HILL_WIDTHS[index % HILL_WIDTHS.length] ?? 1;
    return { height: 1, width, x: width * Math.cos(index), z: width * Math.sin(index) };
  });
const createFeature = (index: number): TerrainFeature => {
  const directionX = 12 * Math.cos((index * Math.PI) / 8);
  const directionZ = 12 * Math.sin((index * Math.PI) / 8);
  const segment = { endX: 8 + directionX, endZ: 8 + directionZ, startX: 8 - directionX, startZ: 8 - directionZ };
  return index % 2 === 0
    ? { ...segment, falloff: 3, height: 1, kind: TerrainFeatureKind.Cliff, width: 12 }
    : { ...segment, height: 1, kind: TerrainFeatureKind.Ridge, width: 6 };
};
const createGroundHeight = (hillCount: number, featureCount: number) =>
  createTerrainShapeHeight({
    base: 0,
    features: Array.from({ length: featureCount }, (_value, index) => createFeature(index)),
    hills: createHills(hillCount),
    residual: { amplitude: 1, octaves: 3, scale: 32, seed: 0 },
  } satisfies TerrainShape);
const getHillsHeight = createGroundHeight(HILL_COUNT, 0);
const getMoreHillsHeight = createGroundHeight(HILL_COUNT + ADDED_COUNT, 0);
const getFeaturesHeight = createGroundHeight(HILL_COUNT, ADDED_COUNT);
const readTile = (getHeight: (x: number, z: number) => number) => {
  for (let row = 0; row < SIDE; row++)
    for (let column = 0; column < SIDE; column++) getHeight(column * STEP, row * STEP);
};
// A tile's heights over the hills a vertex reads, and again with as many more hills or features, so the time each adds
// over the hills reads what a feature costs a vertex against a hill
describe(createTerrainShapeHeight, () => {
  test(`a tile's heights over ${HILL_COUNT} hills`, async ({ bench }) => {
    await bench.compare(
      bench("hills", () => {
        readTile(getHillsHeight);
      }),
      bench(`${ADDED_COUNT} more hills`, () => {
        readTile(getMoreHillsHeight);
      }),
      bench(`${ADDED_COUNT} features`, () => {
        readTile(getFeaturesHeight);
      }),
      // A tile's heights take milliseconds, so more rounds hold the margin steady on a machine running other work
      { ...BENCHMARK_RUN_OPTIONS, iterations: 64 },
    );
  });
});
