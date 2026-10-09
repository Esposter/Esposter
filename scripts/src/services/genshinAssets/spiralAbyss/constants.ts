import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The tower's four tables in the dump, read by their names
export const TOWER_FLOOR_TABLE_NAME = "TowerFloorExcelConfigData";
export const TOWER_LEVEL_TABLE_NAME = "TowerLevelExcelConfigData";
export const TOWER_REWARD_TABLE_NAME = "TowerRewardExcelConfigData";
export const TOWER_SCHEDULE_TABLE_NAME = "TowerScheduleExcelConfigData";
// The condition a chamber's time star reads, its second argument the seconds, and the one its monolith's health star reads,
// Its third argument the percent
export const TOWER_COND_LEFT_TIME = "TOWER_COND_CHALLENGE_LEFT_TIME_MORE_THAN";
export const TOWER_COND_MONOLITH_HEALTH = "TOWER_COND_LEFT_HP_GREATER_THAN";
// Where the three slices are written, in the world's generated folder they are imported on demand from
export const SPIRAL_ABYSS_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "spiralAbyss",
);
export const SPIRAL_ABYSS_FLOORS_PATH: string = join(SPIRAL_ABYSS_GENERATED_DIRECTORY, "floors.json");
export const SPIRAL_ABYSS_REWARDS_PATH: string = join(SPIRAL_ABYSS_GENERATED_DIRECTORY, "rewards.json");
export const SPIRAL_ABYSS_PERIODS_PATH: string = join(SPIRAL_ABYSS_GENERATED_DIRECTORY, "periods.json");
