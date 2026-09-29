import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { UserAchievementInAchievement } from "@esposter/db-schema";

export interface UserAchievementWithDefinition extends UserAchievementInAchievement {
  achievement: AchievementDefinitionEntry;
}
