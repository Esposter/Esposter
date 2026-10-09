import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where the exploration slices are written, the world package's generated folder they are imported on demand from
export const EXPLORATION_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "exploration",
);
// Mondstadt's exploration areas, the slice the world imports on demand as the map is first counted
export const MONDSTADT_EXPLORATION_PATH: string = join(EXPLORATION_GENERATED_DIRECTORY, "mondstadt.json");
