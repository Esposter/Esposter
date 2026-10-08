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
