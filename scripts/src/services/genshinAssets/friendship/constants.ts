import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where the friendship level slice is written, the world package's generated folder it is imported on demand from
export const FRIENDSHIP_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "friendship",
);
// The friendship levels, the slice a character's Companionship EXP is read against
export const FRIENDSHIP_LEVELS_PATH: string = join(FRIENDSHIP_GENERATED_DIRECTORY, "levels.json");
