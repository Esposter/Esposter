import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

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
// The world's generated fishing folder, the slices `genshin:assets fishing` writes and the world imports on demand
const FISHING_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "fishing",
);
export const FISHING_POINTS_PATH: string = join(FISHING_GENERATED_DIRECTORY, "points.json");
export const FISHING_POOLS_PATH: string = join(FISHING_GENERATED_DIRECTORY, "pools.json");
export const FISH_PATH: string = join(FISHING_GENERATED_DIRECTORY, "fish.json");
export const FISHING_RODS_PATH: string = join(FISHING_GENERATED_DIRECTORY, "rods.json");
