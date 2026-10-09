import type { ExcelAchievementGoalRow } from "#src/models/genshinAssets/achievements/ExcelAchievementGoalRow";
import type { ExcelAchievementRow } from "#src/models/genshinAssets/achievements/ExcelAchievementRow";

import {
  ACHIEVEMENT_CATEGORIES_PATH,
  ACHIEVEMENT_COUNT_PATH,
  ACHIEVEMENT_GOAL_TABLE_NAME,
  ACHIEVEMENT_TABLE_NAME,
  ACHIEVEMENTS_GENERATED_DIRECTORY,
  ACHIEVEMENTS_PATH,
} from "#src/services/genshinAssets/achievements/constants";
import { toAchievement } from "#src/services/genshinAssets/achievements/toAchievement";
import { toAchievementCategory } from "#src/services/genshinAssets/achievements/toAchievementCategory";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { achievementCategorySchema, achievementSchema } from "genshin-world";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The achievements and their categories from the game's tables, each kept whole rather than split by trigger, and written
// As two slices in the world's generated folder, and the count of the achievements kept in the world's data. A disused
// Achievement is left out, and each row is checked against the World's own schema before it is written. The slices are
// Written compact, since a player reads them whole as one table
export const writeAchievements = (): void => {
  const rewardMap = readRewardMap();
  const achievements = readExcelTable<ExcelAchievementRow>(ACHIEVEMENT_TABLE_NAME)
    .flatMap((row) => {
      const achievement = toAchievement(row, rewardMap);
      return achievement ? [achievementSchema.parse(achievement)] : [];
    })
    .toSorted((firstAchievement, secondAchievement) => firstAchievement.id - secondAchievement.id);
  const categories = readExcelTable<ExcelAchievementGoalRow>(ACHIEVEMENT_GOAL_TABLE_NAME)
    .map((row) => achievementCategorySchema.parse(toAchievementCategory(row, rewardMap)))
    .toSorted((firstCategory, secondCategory) => firstCategory.orderId - secondCategory.orderId);
  mkdirSync(ACHIEVEMENTS_GENERATED_DIRECTORY, { recursive: true });
  mkdirSync(dirname(ACHIEVEMENT_COUNT_PATH), { recursive: true });
  writeFileSync(ACHIEVEMENTS_PATH, JSON.stringify(achievements));
  writeFileSync(ACHIEVEMENT_CATEGORIES_PATH, JSON.stringify(categories));
  writeFileSync(ACHIEVEMENT_COUNT_PATH, JSON.stringify({ count: achievements.length }));
};
