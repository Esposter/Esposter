import { fitTerrainResidual } from "#src/services/genshinAssets/fit/fitTerrainResidual";
import { mapTerrainResidualGrid } from "#src/services/genshinAssets/fit/mapTerrainResidualGrid";
import { createResidualHeight } from "genshin-engine";
import { describe, expect, test } from "vitest";

// Draws all of the residual west of the origin and none east of it
const getWestWeight = (x: number): number => (x < 0 ? 1 : 0);

describe(fitTerrainResidual, () => {
  const STEP = 4;
  const SIZE = 81;
  const ORIGIN = -160;
  const grid = { originX: ORIGIN, originZ: ORIGIN, size: SIZE, step: STEP, values: new Float64Array(SIZE * SIZE) };
  const sampleResidual = (scale: number, getWeight: (x: number, z: number) => number = () => 1) => {
    const getHeight = createResidualHeight({ amplitude: 2, octaves: 3, scale, seed: 3 });
    return mapTerrainResidualGrid(grid, (x, z) => getWeight(x, z) * getHeight(x, z));
  };

  test("fits the amplitude of the noise a residual was drawn with", () => {
    expect.hasAssertions();

    const { amplitude } = fitTerrainResidual(sampleResidual(64), () => 1);

    expect(Math.abs(amplitude - 2)).toBeLessThan(0.4);
  });

  test("fits the amplitude of the noise where its weight draws it, not over the ground it is faded out of", () => {
    expect.hasAssertions();

    const { amplitude } = fitTerrainResidual(sampleResidual(64, getWestWeight), getWestWeight);

    expect(Math.abs(amplitude - 2)).toBeLessThan(0.2);
  });

  test("fits a finer scale to a rougher residual than to a smoother one", () => {
    expect.hasAssertions();

    const rough = fitTerrainResidual(sampleResidual(16), () => 1);
    const smooth = fitTerrainResidual(sampleResidual(128), () => 1);

    expect(rough.scale).toBeLessThan(smooth.scale);
  });

  test("fits a residual left with an offset as it fits the same residual without one", () => {
    expect.hasAssertions();

    const residual = sampleResidual(16);
    const offset = { ...residual, values: residual.values.map((value) => value + 10) };

    expect(fitTerrainResidual(offset, () => 1)).toStrictEqual(fitTerrainResidual(residual, () => 1));
  });
});
