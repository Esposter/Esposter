import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { AchievementName } from "@esposter/db-schema";

import { AchievementSort } from "@/models/achievement/AchievementSort";

// Until the rarity read lands every rarity is 0, and toSorted keeps equal elements in their category order
export const sortAchievementDefinitions = (
  achievementDefinitions: AchievementDefinitionEntry[],
  sort: AchievementSort,
  achievementRarities?: Record<AchievementName, number>,
): AchievementDefinitionEntry[] =>
  sort === AchievementSort.RarestFirst
    ? achievementDefinitions.toSorted(
        (firstAchievement, secondAchievement) =>
          (achievementRarities?.[firstAchievement.name] ?? 0) - (achievementRarities?.[secondAchievement.name] ?? 0),
      )
    : achievementDefinitions;
