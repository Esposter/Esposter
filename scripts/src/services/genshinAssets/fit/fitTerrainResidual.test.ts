import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { fitTerrainResidual } from "#src/services/genshinAssets/fit/fitTerrainResidual";
import { createResidualHeight } from "genshin-engine";
import { describe, expect, test } from "vitest";

const STEP = 4;
const SIZE = 81;
const ORIGIN = -160;

const sampleResidual = (scale: number): TerrainResidualGrid => {
  const getHeight = createResidualHeight({ amplitude: 2, octaves: 3, scale, seed: 3 });
  const values = new Float64Array(SIZE * SIZE);
  for (let row = 0; row < SIZE; row++)
    for (let column = 0; column < SIZE; column++)
      values[row * SIZE + column] = getHeight(ORIGIN + column * STEP, ORIGIN + row * STEP);
  return { originX: ORIGIN, originZ: ORIGIN, size: SIZE, step: STEP, values };
};

describe(fitTerrainResidual, () => {
  test("fits the amplitude of the noise a residual was drawn with", () => {
    expect.hasAssertions();

    const { amplitude } = fitTerrainResidual(sampleResidual(64));

    expect(Math.abs(amplitude - 2)).toBeLessThan(0.4);
  });

  test("fits a finer scale to a rougher residual than to a smoother one", () => {
    expect.hasAssertions();

    const rough = fitTerrainResidual(sampleResidual(16));
    const smooth = fitTerrainResidual(sampleResidual(128));

    expect(rough.scale).toBeLessThan(smooth.scale);
  });

  test("fits a residual left with an offset as it fits the same residual without one", () => {
    expect.hasAssertions();

    const residual = sampleResidual(16);
    const offset = { ...residual, values: residual.values.map((value) => value + 10) };

    expect(fitTerrainResidual(offset)).toStrictEqual(fitTerrainResidual(residual));
  });
});
