import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where the puzzle slices are written, one per region, the world package's generated folder they are imported on demand from
export const PUZZLE_PLACES_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "puzzles",
);
