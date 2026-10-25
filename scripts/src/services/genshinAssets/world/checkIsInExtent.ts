import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";

// Whether a capital's place stands inside a city area's extent, its edges included
export const checkIsInExtent = ({ extent }: CityArea, { x, z }: GroundPoint): boolean =>
  x >= extent.minX && x <= extent.maxX && z >= extent.minZ && z <= extent.maxZ;
