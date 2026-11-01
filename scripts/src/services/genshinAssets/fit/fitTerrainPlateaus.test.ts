import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { createTerrainResidualGrid } from "#src/services/genshinAssets/fit/createTerrainResidualGrid.test";
import { fitTerrainPlateaus } from "#src/services/genshinAssets/fit/fitTerrainPlateaus";
import { getPlateauBlend, TerrainFeatureKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(fitTerrainPlateaus, () => {
  const STEP = 4;
  const SIZE = 41;
  const ORIGIN = -80;
  const PLATEAU_RADIUS = 24;
  const createGrid = (getValue: (x: number, z: number) => number): TerrainResidualGrid =>
    createTerrainResidualGrid(getValue, { origin: ORIGIN, size: SIZE, step: STEP });

  test("finds a plateau the residual is one of, at its centre and height", () => {
    expect.hasAssertions();

    const plateau = {
      falloff: 6,
      height: 3,
      kind: TerrainFeatureKind.Plateau,
      radius: PLATEAU_RADIUS,
      x: 0,
      z: 0,
    } as const;
    const { features } = fitTerrainPlateaus(createGrid((x, z) => plateau.height * getPlateauBlend(plateau, x, z)));

    expect(features[0]?.kind).toBe(TerrainFeatureKind.Plateau);
    expect(Math.hypot(features[0]?.x ?? Number.NaN, features[0]?.z ?? Number.NaN)).toBeLessThan(PLATEAU_RADIUS / 2);
    expect(features[0]?.height).toBeCloseTo(3, 0);
  });

  test("places no plateau on a residual that is flat", () => {
    expect.hasAssertions();

    const { features } = fitTerrainPlateaus(createGrid(() => 0));

    expect(features).toStrictEqual([]);
  });
});
