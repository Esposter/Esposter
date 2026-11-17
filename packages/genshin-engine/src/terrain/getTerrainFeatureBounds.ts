import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";
import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { GAUSSIAN_REACH_WIDTHS } from "#src/terrain/constants";
import { getSegmentBounds } from "#src/terrain/getSegmentBounds";

// The rectangle a feature's height reaches past zero within
// A case per kind, and a default that assigns the feature to `never`: a kind added to TerrainFeatureKind is not `never`
// There, so it fails typecheck rather than falling through to another kind's bounds
export const getTerrainFeatureBounds = (feature: TerrainFeature): TerrainBounds => {
  switch (feature.kind) {
    case TerrainFeatureKind.Cliff: {
      const { endX, endZ, falloff, startX, startZ, width } = feature;
      return getSegmentBounds(startX, startZ, endX, endZ, width + falloff);
    }
    case TerrainFeatureKind.Plateau: {
      const { falloff, radius, x, z } = feature;
      const reach = radius + falloff;
      return { maxX: x + reach, maxZ: z + reach, minX: x - reach, minZ: z - reach };
    }
    case TerrainFeatureKind.Ridge: {
      const { endX, endZ, startX, startZ, width } = feature;
      return getSegmentBounds(startX, startZ, endX, endZ, GAUSSIAN_REACH_WIDTHS * width);
    }
    default: {
      const unhandled: never = feature;
      throw new RangeError(`Unknown terrain feature ${JSON.stringify(unhandled)}`);
    }
  }
};
