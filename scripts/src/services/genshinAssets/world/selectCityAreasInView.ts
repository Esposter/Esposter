import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";

import { ARCHITECTURE_VIEW_METRES } from "#src/services/genshinAssets/world/constants";

// How far a place stands from a city area's extent, none where the extent contains it
const getExtentDistance = ({ extent }: CityArea, { x, z }: GroundPoint): number =>
  Math.hypot(Math.max(extent.minX - x, 0, x - extent.maxX), Math.max(extent.minZ - z, 0, z - extent.maxZ));
// The city areas a capital's view covers, nearest first: every one whose extent comes within the architecture radius of
// Its place. A capital is laid out across several areas, each its own blob (Inazuma City's lower town, upper town and
// Keep among them), so the view reads every one it reaches rather than the one the capital stands in
export const selectCityAreasInView = (areas: readonly CityArea[], place: GroundPoint): CityArea[] =>
  areas
    .map((area) => ({ area, distance: getExtentDistance(area, place) }))
    .filter(({ distance }) => distance <= ARCHITECTURE_VIEW_METRES)
    .toSorted((firstArea, secondArea) => firstArea.distance - secondArea.distance)
    .map(({ area }) => area);
