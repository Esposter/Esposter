import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { RidgeFeature } from "genshin-engine";

import { fitTerrainRidges } from "#src/services/genshinAssets/fit/fitTerrainRidges";
import { getRidgeBlend, TerrainFeatureKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(fitTerrainRidges, () => {
  const STEP = 6;
  const SIZE = 21;
  const ORIGIN = -60;
  const createGrid = (getValue: (x: number, z: number) => number): TerrainResidualGrid => {
    const values = new Float64Array(SIZE * SIZE);
    for (let row = 0; row < SIZE; row++)
      for (let column = 0; column < SIZE; column++)
        values[row * SIZE + column] = getValue(ORIGIN + column * STEP, ORIGIN + row * STEP);
    return { originX: ORIGIN, originZ: ORIGIN, size: SIZE, step: STEP, values };
  };

  test("finds a ridge the residual is one of, near its heading and at its height", () => {
    expect.hasAssertions();

    // A 48 metre segment centred on the origin at 30 degrees, between the headings the fit tries
    const heading = Math.PI / 6;
    const ridge: RidgeFeature = {
      endX: 24 * Math.cos(heading),
      endZ: 24 * Math.sin(heading),
      height: 10,
      kind: TerrainFeatureKind.Ridge,
      startX: -24 * Math.cos(heading),
      startZ: -24 * Math.sin(heading),
      width: 12,
    };
    const { features } = fitTerrainRidges(createGrid((x, z) => ridge.height * getRidgeBlend(ridge, x, z)));
    const [fitted] = features;
    const fittedHeading = Math.atan2(
      (fitted?.endZ ?? Number.NaN) - (fitted?.startZ ?? Number.NaN),
      (fitted?.endX ?? Number.NaN) - (fitted?.startX ?? Number.NaN),
    );

    expect(fitted?.kind).toBe(TerrainFeatureKind.Ridge);
    expect(Math.abs(fittedHeading - heading)).toBeLessThanOrEqual(Math.PI / 8);
    expect(Math.abs((fitted?.height ?? Number.NaN) - ridge.height)).toBeLessThan(1);
  });

  test("places no ridge on a residual that is flat", () => {
    expect.hasAssertions();

    const { features } = fitTerrainRidges(createGrid(() => 0));

    expect(features).toStrictEqual([]);
  });
});
