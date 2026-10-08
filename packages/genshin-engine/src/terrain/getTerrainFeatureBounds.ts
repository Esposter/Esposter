import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";
import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { GAUSSIAN_REACH_WIDTHS } from "#src/terrain/constants";

const TerrainFeatureKindBoundsMap = {
  [TerrainFeatureKind.Cliff]: (feature) => {
    const { endX, endZ, falloff, startX, startZ, width } = feature;
    const reach = width + falloff;
    return {
      maxX: Math.max(startX, endX) + reach,
      maxZ: Math.max(startZ, endZ) + reach,
      minX: Math.min(startX, endX) - reach,
      minZ: Math.min(startZ, endZ) - reach,
    };
  },
  [TerrainFeatureKind.Plateau]: (feature) => {
    const { falloff, radius, x, z } = feature;
    const reach = radius + falloff;
    return { maxX: x + reach, maxZ: z + reach, minX: x - reach, minZ: z - reach };
  },
  [TerrainFeatureKind.Ridge]: (feature) => {
    const { endX, endZ, startX, startZ, width } = feature;
    const reach = GAUSSIAN_REACH_WIDTHS * width;
    return {
      maxX: Math.max(startX, endX) + reach,
      maxZ: Math.max(startZ, endZ) + reach,
      minX: Math.min(startX, endX) - reach,
      minZ: Math.min(startZ, endZ) - reach,
    };
  },
} as const satisfies {
  [K in TerrainFeatureKind]: (feature: Extract<TerrainFeature, { kind: K }>) => TerrainBounds;
};

// The rectangle a feature's height reaches past zero within
export const getTerrainFeatureBounds = (feature: TerrainFeature): TerrainBounds =>
  TerrainFeatureKindBoundsMap[feature.kind](feature as never);
