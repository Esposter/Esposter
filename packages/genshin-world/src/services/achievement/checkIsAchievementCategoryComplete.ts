import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";

import { checkIsAchievementFinished } from "#src/services/achievement/checkIsAchievementFinished";

// Whether every achievement of a category is finished. A category with no achievement is never complete
export const checkIsAchievementCategoryComplete = (
  categoryId: number,
  achievements: readonly Achievement[],
  progressMap: ReadonlyMap<number, AchievementProgress>,
): boolean => {
  const categoryAchievements = achievements.filter((achievement) => achievement.categoryId === categoryId);
  return (
    categoryAchievements.length > 0 &&
    categoryAchievements.every(({ id }) => checkIsAchievementFinished(id, progressMap))
  );
};
