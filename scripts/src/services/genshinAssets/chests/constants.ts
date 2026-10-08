import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where the chest slices are written, one per region, the world package's generated folder they are imported on demand from
export const CHEST_PLACES_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "chests",
);
// The map's layer of the ground and above. Points on the layers under it stand on floors of their own, which no chest
// Place is written for yet
export const GROUND_LAYER = 0;
