import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { CliffFeature } from "genshin-engine";

import { fitTerrainCliffs } from "#src/services/genshinAssets/fit/fitTerrainCliffs";
import { getCliffBlend, TerrainFeatureKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(fitTerrainCliffs, () => {
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

  test("finds a cliff the residual is one of, near its heading and at its height", () => {
    expect.hasAssertions();

    // A 48 metre segment centred on the origin at 30 degrees, between the headings the fit tries
    const heading = Math.PI / 6;
    const cliff: CliffFeature = {
      endX: 24 * Math.cos(heading),
      endZ: 24 * Math.sin(heading),
      falloff: 6,
      height: 10,
      kind: TerrainFeatureKind.Cliff,
      startX: -24 * Math.cos(heading),
      startZ: -24 * Math.sin(heading),
      width: 24,
    };
    const { features } = fitTerrainCliffs(createGrid((x, z) => cliff.height * getCliffBlend(cliff, x, z)));
    const [fitted] = features;
    const fittedHeading = Math.atan2(
      (fitted?.endZ ?? Number.NaN) - (fitted?.startZ ?? Number.NaN),
      (fitted?.endX ?? Number.NaN) - (fitted?.startX ?? Number.NaN),
    );

    expect(fitted?.kind).toBe(TerrainFeatureKind.Cliff);
    expect(Math.abs(fittedHeading - heading)).toBeLessThanOrEqual(Math.PI / 8);
    // The nearest heading tried stands off the cliff's, so its terrace fitted by least squares reads a little low
    expect(Math.abs((fitted?.height ?? Number.NaN) - cliff.height)).toBeLessThan(1.5);
  });

  test("places a cliff the residual is exactly one of at its height, leaving none", () => {
    expect.hasAssertions();

    // A 48 metre segment at a heading the fit tries, on the one centre this grid holds for that length, so the fit's
    // Shape is the cliff itself and its height fitted to what the cliff draws is the cliff's own
    const cliff: CliffFeature = {
      endX: 18,
      endZ: -6,
      falloff: 6,
      height: 1,
      kind: TerrainFeatureKind.Cliff,
      startX: -30,
      startZ: -6,
      width: 24,
    };
    const { features, remainder } = fitTerrainCliffs(createGrid((x, z) => cliff.height * getCliffBlend(cliff, x, z)));

    expect(features).toStrictEqual([cliff]);
    expect(remainder.values.every((value) => value === 0)).toBe(true);
  });

  test("places no cliff on a residual that is flat", () => {
    expect.hasAssertions();

    const { features } = fitTerrainCliffs(createGrid(() => 0));

    expect(features).toStrictEqual([]);
  });
});
