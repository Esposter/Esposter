import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";
import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { GAUSSIAN_REACH_WIDTHS } from "#src/terrain/constants";
import { getSegmentBounds } from "#src/terrain/getSegmentBounds";

const TerrainFeatureKindBoundsMap = {
  [TerrainFeatureKind.Cliff]: (feature) => {
    const { endX, endZ, falloff, startX, startZ, width } = feature;
    return getSegmentBounds(startX, startZ, endX, endZ, width + falloff);
  },
  [TerrainFeatureKind.Plateau]: (feature) => {
    const { falloff, radius, x, z } = feature;
    const reach = radius + falloff;
    return { maxX: x + reach, maxZ: z + reach, minX: x - reach, minZ: z - reach };
  },
  [TerrainFeatureKind.Ridge]: (feature) => {
    const { endX, endZ, startX, startZ, width } = feature;
    return getSegmentBounds(startX, startZ, endX, endZ, GAUSSIAN_REACH_WIDTHS * width);
  },
} as const satisfies {
  [K in TerrainFeatureKind]: (feature: Extract<TerrainFeature, { kind: K }>) => TerrainBounds;
};

// The rectangle a feature's height reaches past zero within
export const getTerrainFeatureBounds = (feature: TerrainFeature): TerrainBounds =>
  TerrainFeatureKindBoundsMap[feature.kind](feature as never);
