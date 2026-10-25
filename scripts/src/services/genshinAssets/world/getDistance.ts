import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";

export const getDistance = ({ centroid }: CityArea, place: GroundPoint): number =>
  Math.hypot(centroid.x - place.x, centroid.z - place.z);
