import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";

import { computeExtentGap } from "#src/services/genshinAssets/world/computeExtentGap";
import { ARCHITECTURE_VIEW_METRES } from "#src/services/genshinAssets/world/constants";
import { toPointExtent } from "#src/services/genshinAssets/world/toPointExtent";

// The city areas a capital's view covers, nearest first: every one whose extent comes within the architecture radius of
// Its place. A capital is laid out across several areas, each its own blob (Inazuma City's lower town, upper town and
// Keep among them), so the view reads every one it reaches rather than the one the capital stands in
export const selectCityAreasInView = (areas: readonly CityArea[], point: GroundPoint): CityArea[] =>
  areas
    .map((area) => ({ area, distance: computeExtentGap(area.extent, toPointExtent(point)) }))
    .filter(({ distance }) => distance <= ARCHITECTURE_VIEW_METRES)
    .toSorted((firstArea, secondArea) => firstArea.distance - secondArea.distance)
    .map(({ area }) => area);
