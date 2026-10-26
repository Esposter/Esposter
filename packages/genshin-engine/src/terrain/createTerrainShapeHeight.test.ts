import type { TerrainShape } from "#src/models/terrain/TerrainShape";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { createResidualHeight } from "#src/terrain/createResidualHeight";
import { createTerrainShapeHeight } from "#src/terrain/createTerrainShapeHeight";
import { describe, expect, test } from "vitest";

describe(createTerrainShapeHeight, () => {
  const residual = { amplitude: 2, octaves: 2, scale: 8, seed: 3 };

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

  test("draws no residual at a feature's centre, and the whole residual past every feature's reach", () => {
    expect.hasAssertions();

    const shape: TerrainShape = {
      base: 1,
      features: [{ falloff: 0.5, height: 2, kind: TerrainFeatureKind.Plateau, radius: 4, x: 5, z: 9 }],
      hills: [],
    };
    const getHeight = createTerrainShapeHeight(shape);
    const getResidualHeight = createResidualHeight(residual);
    const getShapeHeight = createTerrainShapeHeight({ ...shape, residual });

    expect(getResidualHeight(5, 9)).not.toBe(0);
    expect(getShapeHeight(5, 9)).toBe(getHeight(5, 9));
    expect(getShapeHeight(50, 50)).toBeCloseTo(getHeight(50, 50) + getResidualHeight(50, 50));
  });

  test("draws a ground laid over another as it is drawn alone where its hills stand, and the base under it past them", () => {
    expect.hasAssertions();

    const overlay: TerrainShape = {
      base: 5,
      hills: [
        { height: 3, width: 10, x: 100, z: 0 },
        { height: 2, width: 10, x: 140, z: 0 },
      ],
      residual,
    };
    const getHeight = createTerrainShapeHeight({ base: 1, hills: [] }, overlay);

    expect(getHeight(120, 0)).toBeCloseTo(createTerrainShapeHeight(overlay)(120, 0));
    expect(getHeight(1000, 0)).toBeCloseTo(1 + createResidualHeight(residual)(1000, 0));
  });
});
