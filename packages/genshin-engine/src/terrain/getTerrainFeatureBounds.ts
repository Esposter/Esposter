import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";
import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { GAUSSIAN_REACH_WIDTHS } from "#src/terrain/constants";
import { getSegmentBounds } from "#src/terrain/getSegmentBounds";

// The rectangle a feature's height reaches past zero within
export const getTerrainFeatureBounds = (feature: TerrainFeature): TerrainBounds => {
  if (feature.kind === TerrainFeatureKind.Cliff) {
    const { endX, endZ, falloff, startX, startZ, width } = feature;
    return getSegmentBounds(startX, startZ, endX, endZ, width + falloff);
  }
  if (feature.kind === TerrainFeatureKind.Plateau) {
    const { falloff, radius, x, z } = feature;
    const reach = radius + falloff;
    return { maxX: x + reach, maxZ: z + reach, minX: x - reach, minZ: z - reach };
  }
  const { endX, endZ, startX, startZ, width } = feature;
  return getSegmentBounds(startX, startZ, endX, endZ, GAUSSIAN_REACH_WIDTHS * width);
};
