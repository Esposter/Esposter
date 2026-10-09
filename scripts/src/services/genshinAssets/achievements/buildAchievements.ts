import type { ExcelAchievementGoalRow } from "#src/models/genshinAssets/achievements/ExcelAchievementGoalRow";
import type { ExcelAchievementRow } from "#src/models/genshinAssets/achievements/ExcelAchievementRow";
import type { Achievement } from "genshin-world";

import {
  ACHIEVEMENT_COUNT_PATH,
  ACHIEVEMENT_GOAL_TABLE_NAME,
  ACHIEVEMENT_TABLE_NAME,
} from "#src/services/genshinAssets/achievements/constants";
import { toAchievement } from "#src/services/genshinAssets/achievements/toAchievement";
import { toAchievementCategory } from "#src/services/genshinAssets/achievements/toAchievementCategory";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { achievementCategorySchema, achievementSchema, GameDataset } from "genshin-world";

// The achievements and their categories from the game's tables, each kept whole rather than split by trigger, and published
// As two records. A disused achievement is left out, and each row is checked against the world's own schema before it is
// Published. The count of the achievements kept is still written into the world's data, since the save's achievement slice
// Is bounded by a count the bundle holds
export const buildAchievements = (): { achievements: Achievement[]; objects: Record<string, unknown> } => {
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
  writeJsonFile(ACHIEVEMENT_COUNT_PATH, { count: achievements.length });
  return {
    achievements,
    objects: {
      [`${GameDataset.Achievements}/achievements`]: achievements,
      [`${GameDataset.Achievements}/categories`]: categories,
    },
  };
};
