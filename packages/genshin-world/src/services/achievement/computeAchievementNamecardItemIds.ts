import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";

import { checkIsAchievementCategoryComplete } from "#src/services/achievement/checkIsAchievementCategoryComplete";

// The namecard item of every category whose completion pays one, in the categories' order. A category with no end pays
// None, its namecard item being zero, and a category with an unfinished achievement pays none yet
export const computeAchievementNamecardItemIds = (
  categories: readonly AchievementCategory[],
  achievements: readonly Achievement[],
  progressMap: ReadonlyMap<number, AchievementProgress>,
): number[] =>
  categories
    .filter(
      ({ id, namecardItemId }) =>
        namecardItemId !== 0 && checkIsAchievementCategoryComplete(id, achievements, progressMap),
    )
    .map(({ namecardItemId }) => namecardItemId);
