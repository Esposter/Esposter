import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { createTerrainFeaturesHeight } from "#src/terrain/createTerrainFeaturesHeight";
import { getCliffHeight } from "#src/terrain/getCliffHeight";
import { getPlateauHeight } from "#src/terrain/getPlateauHeight";
import { getRidgeHeight } from "#src/terrain/getRidgeHeight";
import { describe, expect, test } from "vitest";

describe(createTerrainFeaturesHeight, () => {
  test("sums every feature at points across the cells its reach crosses, as each feature alone draws it", () => {
    expect.hasAssertions();

    // Features reaching across the cell edges at multiples of the cell size, so a point reads more than one cell's list
    const cliff: TerrainFeature = {
      endX: 120,
      endZ: 0,
      falloff: 4,
      height: 6,
      kind: TerrainFeatureKind.Cliff,
      startX: 60,
      startZ: 0,
      width: 20,
    };
    const plateau: TerrainFeature = {
      falloff: 8,
      height: -3,
      kind: TerrainFeatureKind.Plateau,
      radius: 30,
      x: 64,
      z: 64,
    };
    const ridge: TerrainFeature = {
      endX: 0,
      endZ: 200,
      height: 5,
      kind: TerrainFeatureKind.Ridge,
      startX: -10,
      startZ: -10,
      width: 25,
    };
    const getHeight = createTerrainFeaturesHeight([cliff, plateau, ridge]);

    for (let x = -100; x <= 200; x += 40)
      for (let z = -100; z <= 200; z += 40)
        expect(getHeight(x, z)).toBeCloseTo(
          getCliffHeight(cliff, x, z) + getPlateauHeight(plateau, x, z) + getRidgeHeight(ridge, x, z),
        );
  });
});
