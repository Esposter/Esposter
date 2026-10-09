import type { GroundPoint } from "genshin-engine";

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
  let nearest: { distance: number; region: string } | undefined;
  for (const { position: mapPosition, region } of regionMapPoints) {
    const distance = Math.hypot(mapPosition.x - position.x, mapPosition.z - position.z);
    if (!nearest || distance < nearest.distance) nearest = { distance, region };
  }
  return nearest && nearest.distance <= maxDistance ? nearest.region : undefined;
};
