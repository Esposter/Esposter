import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

// Where the official map's points of some kinds were placed: each region's places by its region id, and how many points
// Lie on a layer under the ground or in no mapped region, which are left out for now so the report says what was not placed
export interface MapPointPlacement<Kind extends string> {
  places: Record<string, MapPointPlace<Kind>[]>;
  skippedUnderground: number;
  skippedUnmapped: number;
}
