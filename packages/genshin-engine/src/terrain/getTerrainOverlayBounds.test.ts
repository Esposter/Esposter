import type { TerrainShape } from "#src/models/terrain/TerrainShape";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { checkTerrainBoundsOverlap } from "#src/terrain/checkTerrainBoundsOverlap";
import { createTerrainShapeHeight } from "#src/terrain/createTerrainShapeHeight";
import { getTerrainOverlayBounds } from "#src/terrain/getTerrainOverlayBounds";
import { describe, expect, test } from "vitest";

describe(getTerrainOverlayBounds, () => {
  // A ground drawn everywhere, its hills, plateau and residual sharing the overlay's cells
  const base: TerrainShape = {
    base: 2,
    features: [{ falloff: 20, height: 4, kind: TerrainFeatureKind.Plateau, radius: 30, x: 180, z: 10 }],
    hills: [{ height: 6, width: 40, x: 220, z: -20 }],
    residual: { amplitude: 1.5, octaves: 3, scale: 24, seed: 7 },
  };
  // A ground with every layer one can lay: hills, a ridge, a cliff, a plateau, and a residual within a fade reaching past
  // Them all
  const overlay: TerrainShape = {
    base: 9,
    features: [
      { endX: 350, endZ: -60, height: 5, kind: TerrainFeatureKind.Ridge, startX: 250, startZ: -40, width: 8 },
      {
        endX: 330,
        endZ: 230,
        falloff: 4,
        height: 3,
        kind: TerrainFeatureKind.Cliff,
        startX: 280,
        startZ: 60,
        width: 6,
      },
      { falloff: 5, height: 2, kind: TerrainFeatureKind.Plateau, radius: 10, x: 320, z: -10 },
    ],
    hills: [
      { height: 4, width: 20, x: 300, z: 0 },
      { height: 3, width: 15, x: 340, z: 30 },
      { height: 5, width: 20, x: 300, z: -150 },
    ],
    residual: {
      amplitude: 2,
      fade: {
        cellSize: 20,
        clearings: [],
        origin: [420, 120],
        size: [4, 4],
        weights: Array.from({ length: 16 }, () => 1),
      },
      octaves: 2,
      scale: 16,
      seed: 3,
    },
  };

  test("holds every height the ground changes laid over another, and leaves out the ground far from it", () => {
    expect.hasAssertions();

    const bounds = getTerrainOverlayBounds(overlay);
    const { maxX, maxZ, minX, minZ } = bounds;
    const getBaseHeight = createTerrainShapeHeight(base);
    const getLaidHeight = createTerrainShapeHeight(base, overlay);
    const sampleCount = 64;
    const xs = Array.from(
      { length: sampleCount },
      (_value, index) => minX - 100 + ((maxX - minX + 200) * index) / sampleCount,
    );
    const zs = Array.from(
      { length: sampleCount },
      (_value, index) => minZ - 100 + ((maxZ - minZ + 200) * index) / sampleCount,
    );
    // Just past each edge: a minimum is the first point of a cell the ground is filed in, a maximum the first past them
    const outside = [
      ...xs.flatMap((x) => [
        [x, minZ - 0.01],
        [x, maxZ],
      ]),
      ...zs.flatMap((z) => [
        [minX - 0.01, z],
        [maxX, z],
      ]),
    ];

    expect(outside.filter(([x = 0, z = 0]) => getLaidHeight(x, z) !== getBaseHeight(x, z))).toStrictEqual([]);
    expect(checkTerrainBoundsOverlap(bounds, { maxX: 2000, maxZ: 2000, minX: 1000, minZ: 1000 })).toBe(false);
  });
});
