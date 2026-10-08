import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The region whose statue levels are written. Each later region's levels join with its page
export const MONDSTADT_CITY_ID = 1;
// Where the statue level slices are written, the world package's generated folder they are imported on demand from
export const STATUE_LEVELS_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "statueLevels",
);
// Mondstadt's statue levels, the slice the world imports on demand when its statues are first needed
export const MONDSTADT_STATUE_LEVELS_PATH: string = join(STATUE_LEVELS_GENERATED_DIRECTORY, "mondstadt.json");
