import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The offering whose levels are written: the Frostbearing Tree in Dragonspine, Mondstadt's. Each later offering's levels
// Join with its region's page
export const FROSTBEARING_TREE_OFFERING_ID = 1;
// Where the offering level slices are written, the world package's generated folder they are imported on demand from
export const OFFERING_LEVELS_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "offerings",
);
// The Frostbearing Tree's levels, the slice the world imports on demand when the tree is first offered to
export const FROSTBEARING_TREE_LEVELS_PATH: string = join(OFFERING_LEVELS_GENERATED_DIRECTORY, "frostbearingTree.json");
// The official map's label id of the Frostbearing Tree, whose one point in Mondstadt's area is the tree's place
export const FROSTBEARING_TREE_LABEL_ID = 158;
// Where the Frostbearing Tree's place is written, one slice per region, the world package's generated folder they are imported on demand from
export const FROSTBEARING_TREE_PLACES_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "frostbearingTreePlaces",
);
