import type { GroundPoint } from "genshin-engine";

import { findNearest } from "#src/services/genshinAssets/shared/findNearest";

// A point of the official map carried into the game's axes and named by its region
export interface RegionMapPoint {
  position: GroundPoint;
  region: string;
}

// The region of the nearest mapped point to a place, or none when even the nearest lies farther than the given distance:
// A place off every mapped region, on an island no region is mapped to, is in none
export const classifyPlacementRegion = (
  position: GroundPoint,
  regionMapPoints: readonly RegionMapPoint[],
  maxDistance: number,
): string | undefined => {
  const getDistance = ({ position: mapPosition }: RegionMapPoint): number =>
    Math.hypot(mapPosition.x - position.x, mapPosition.z - position.z);
  const nearest = findNearest(regionMapPoints, getDistance);
  return nearest && getDistance(nearest) <= maxDistance ? nearest.region : undefined;
};
