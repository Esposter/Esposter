import type { AchievementDefinitionView } from "#shared/models/achievement/AchievementDefinitionView";
import type { UserAchievementWithDefinition } from "#src/models/achievement/UserAchievementWithDefinition";
import type { UserAchievementInAchievementWithRelations } from "@esposter/db-schema";

export const toUserAchievementWithDefinition = (
  userAchievement: UserAchievementInAchievementWithRelations,
  achievementDefinition: AchievementDefinitionView,
): UserAchievementWithDefinition => ({
  ...userAchievement,
  achievement: { ...achievementDefinition, name: userAchievement.achievement.name },
});
