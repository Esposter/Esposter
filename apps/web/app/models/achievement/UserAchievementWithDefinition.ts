import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { UserAchievement } from "@esposter/db-schema";

export interface UserAchievementWithDefinition extends UserAchievement {
  achievement: AchievementDefinitionEntry;
}
