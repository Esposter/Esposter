import type { GroundPoint } from "genshin-engine";

// A region's first landmark and where it stands: the areas of the game's own area table whose transport points stand
// Round it, each named as the table's English text names it, or, where the dump holds none of those areas, the place
// The scene has always set it at by hand. Its city area is found by that place (`selectCapitalCityArea`)
export type RegionCapital = { areaNames: string[]; landmarkId: string } | { landmarkId: string; position: GroundPoint };
