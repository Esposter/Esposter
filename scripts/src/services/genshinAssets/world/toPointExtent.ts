import type { CityAreaExtent } from "#src/models/genshinAssets/world/CityAreaExtent";
import type { GroundPoint } from "genshin-engine";

// A point as an extent of no size, so a place measures against a city area the way one area measures against another
export const toPointExtent = ({ x, z }: GroundPoint): CityAreaExtent => ({ maxX: x, maxZ: z, minX: x, minZ: z });
