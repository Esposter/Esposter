import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";

import { achievementSchema } from "#src/models/achievement/Achievement";
import { achievementCategorySchema } from "#src/models/achievement/AchievementCategory";
import { z } from "zod";

// The achievement table and its categories, the slices `pnpm -C scripts genshin:assets achievements` writes, imported on
// Demand as chunks of their own and checked against their shapes as they arrive
export const readAchievements = async (): Promise<{
  achievements: Achievement[];
  categories: AchievementCategory[];
}> => {
  const [{ default: achievements }, { default: categories }] = await Promise.all([
    import("#src/generated/achievements/achievements.json"),
    import("#src/generated/achievements/categories.json"),
  ]);
  return {
    achievements: z.array(achievementSchema).parse(achievements),
    categories: z.array(achievementCategorySchema).parse(categories),
  };
};
