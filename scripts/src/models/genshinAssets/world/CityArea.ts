import type { CityAreaExtent } from "#src/models/genshinAssets/world/CityAreaExtent";
import type { GroundPoint } from "genshin-engine";

// One city area's blob, `Area_<code>_City`, by its code: the bounding box and the centroid of the placements it holds,
// In the same game axes as a capital's place, and how many placements that is
export interface CityArea {
  centroid: GroundPoint;
  code: string;
  extent: CityAreaExtent;
  placementCount: number;
}
