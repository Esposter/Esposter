import type { TerrainShape } from "#src/models/terrain/TerrainShape";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { createTerrainShapeHeight } from "#src/terrain/createTerrainShapeHeight";
import { describe, expect, test } from "vitest";

describe(createTerrainShapeHeight, () => {
  test("adds the hills, the features and the residual at a point, and a layer the shape leaves out adds nothing", () => {
    expect.hasAssertions();

    const shape: TerrainShape = {
      base: 1,
      features: [{ falloff: 0.5, height: 2, kind: TerrainFeatureKind.Plateau, radius: 4, x: 0, z: 0 }],
      hills: [{ height: 3, width: 10, x: 0, z: 0 }],
    };

    expect(createTerrainShapeHeight(shape)(0, 0)).toBe(1 + 3 + 2);
    expect(createTerrainShapeHeight({ base: 1, hills: [] })(50, 50)).toBe(1);
  });
});
