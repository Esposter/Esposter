import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The game's achievement table and its category table in the dump, read by their names. Their rewards come from the reward
// Table, which the rewards reader holds
export const ACHIEVEMENT_TABLE_NAME = "AchievementExcelConfigData";
export const ACHIEVEMENT_GOAL_TABLE_NAME = "AchievementGoalExcelConfigData";
// The item a reward pays in Primogems, the only item an achievement's reward is made of
export const PRIMOGEM_ITEM_ID = 201;
// The `isShow` value the table gives an achievement kept hidden until it is done
export const HIDDEN_SHOW_TYPE = "SHOWTYPE_HIDE";
// Where the slices are written, in the world's generated folder they are imported on demand from. The text is one chunk a
// Language, beside them
export const ACHIEVEMENTS_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "achievements",
);
export const ACHIEVEMENTS_PATH: string = join(ACHIEVEMENTS_GENERATED_DIRECTORY, "achievements.json");
export const ACHIEVEMENT_CATEGORIES_PATH: string = join(ACHIEVEMENTS_GENERATED_DIRECTORY, "categories.json");
export const ACHIEVEMENT_TEXT_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "achievementText",
);
// The count of the achievements the table keeps, in the world's data folder beside the data its rules import whole.
// The save's achievement slice is bounded by it, so the bound moves with the game's table
export const ACHIEVEMENT_COUNT_PATH: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "data",
  "achievements",
  "achievementCount.json",
);
