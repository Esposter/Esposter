import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The Imaginarium Theater's two tables in the dump, read by their names
export const ROLE_COMBAT_SCHEDULE_TABLE_NAME = "RoleCombatScheduleExcelConfigData";
export const ROLE_COMBAT_DIFFICULTY_TABLE_NAME = "RoleCombatDifficultyExcelConfigData";
// Where the two slices are written, in the world's generated folder they are imported on demand from
export const IMAGINARIUM_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "imaginarium",
);
export const IMAGINARIUM_SEASONS_PATH: string = join(IMAGINARIUM_GENERATED_DIRECTORY, "seasons.json");
export const IMAGINARIUM_DIFFICULTIES_PATH: string = join(IMAGINARIUM_GENERATED_DIRECTORY, "difficulties.json");
