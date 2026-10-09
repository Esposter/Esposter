import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where the friendship slice is written, the world package's generated folder it is imported on demand from
export const FRIENDSHIP_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "friendship",
);
// The friendship slice: the levels a character's Companionship EXP is read against, and the namecards each character's
// Friendship opens, in the one file the world imports on demand
export const FRIENDSHIP_PATH: string = join(FRIENDSHIP_GENERATED_DIRECTORY, "friendship.json");
// The Friendship Level whose reward is a character's namecard
export const FRIENDSHIP_NAMECARD_LEVEL = 10;
// The material type a namecard item is filed under in the dump's material table
export const NAMECARD_MATERIAL_TYPE = "MATERIAL_NAMECARD";
