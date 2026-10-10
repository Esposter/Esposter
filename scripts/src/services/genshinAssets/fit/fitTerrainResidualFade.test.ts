import { fitTerrainResidualFade } from "#src/services/genshinAssets/fit/fitTerrainResidualFade";
import { mapTerrainResidualGrid } from "#src/services/genshinAssets/fit/mapTerrainResidualGrid";
import { describe, expect, test } from "vitest";

describe(fitTerrainResidualFade, () => {
  const SIZE = 33;
  const CELL_SIZE = 16;
  const grid = { originX: 0, originZ: 0, size: SIZE, step: 2, values: new Float64Array(SIZE * SIZE) };

  test("draws none where the ground holds within the gate and all where it misses by twice it, softened between", () => {
    expect.hasAssertions();

    const fade = fitTerrainResidualFade(
      mapTerrainResidualGrid(grid, (x) => (x < 32 ? 0 : 10)),
      CELL_SIZE,
      1,
    );

    expect(fade).toStrictEqual({
      cellSize: CELL_SIZE,
      origin: [0, 0],
      size: [5, 5],
      weights: Array.from({ length: 5 }, () => [0, 0.33, 0.67, 1, 1]).flat(),
    });
  });

  test("draws all of the residual where nothing was sampled", () => {
    expect.hasAssertions();

    const { weights } = fitTerrainResidualFade(
      mapTerrainResidualGrid(grid, () => Number.NaN),
      CELL_SIZE,
      1,
    );

    expect(weights).toStrictEqual(Array.from({ length: 25 }, () => 1));
  });
});
