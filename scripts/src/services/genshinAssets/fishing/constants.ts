// The official map's label of a fishing point, from its label tree as the points were read
export const FISHING_POINT_LABEL_ID = 261;
// The kind every fishing point is placed as, the one kind the fishing points' fit carries
export const FISHING_POINT_KIND = "fishing";
// The game's city ids a pool is filed under, each mapped to the region the map's areas and the world's catalogue name.
// Nod-Krai's city is filed under no pool, so its points draw from no stock yet
export const CityIdRegionMap: Record<number, string> = {
  1: "mondstadt",
  2: "liyue",
  3: "inazuma",
  4: "sumeru",
  5: "fontaine",
  6: "natlan",
  7: "snezhnaya",
};
