import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";

import { achievementSchema } from "#src/models/achievement/Achievement";
import { achievementCategorySchema } from "#src/models/achievement/AchievementCategory";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The achievement table and its categories, which `pnpm -C scripts genshin:assets achievements` writes.
// Both are fetched by their keys from the hosted game data and checked against their shapes as they arrive
export const readAchievements = async (
  gameDataBaseUrl: string,
): Promise<{ achievements: Achievement[]; categories: AchievementCategory[] }> => {
  const [achievements, categories] = await Promise.all([
    readGameData(gameDataBaseUrl, "achievements/achievements", z.array(achievementSchema)),
    readGameData(gameDataBaseUrl, "achievements/categories", z.array(achievementCategorySchema)),
  ]);
  return { achievements, categories };
};
