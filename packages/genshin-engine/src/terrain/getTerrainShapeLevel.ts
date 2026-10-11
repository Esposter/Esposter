import type { GaussianHills } from "#src/models/terrain/GaussianHills";
import type { PlateauFeature } from "#src/models/terrain/PlateauFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { GAUSSIAN_REACH_WIDTHS } from "#src/terrain/constants";

// A ground laid over another stands on its own base, so it is lifted by its base over the other's: a plateau of that
// Height on the disc round the box its hills stand in, falling to none across its widest hill's reach past it, where its
// Hills fall to none too. A ground with no hills has no level and stands on the base under it
export const getTerrainShapeLevel = ({ base, hills }: GaussianHills, baseUnder: number): PlateauFeature | undefined => {
  if (hills.length === 0) return undefined;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let maxWidth = 0;
  for (const { width, x, z } of hills) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
    maxWidth = Math.max(maxWidth, width);
  }
  return {
    falloff: GAUSSIAN_REACH_WIDTHS * maxWidth,
    height: base - baseUnder,
    kind: TerrainFeatureKind.Plateau,
    radius: Math.hypot(maxX - minX, maxZ - minZ) / 2,
    x: (minX + maxX) / 2,
    z: (minZ + maxZ) / 2,
  };
};
