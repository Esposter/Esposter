import type { UserAchievementWithDefinition } from "#shared/models/achievement/UserAchievementWithDefinition";
import type { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import type { AchievementName, UserAchievementWithRelations } from "@esposter/db-schema";

export const mapToUserAchievementWithDefinition = (
  userAchievement: UserAchievementWithRelations,
  achievementDefinition: (typeof AchievementDefinitionMap)[AchievementName],
): UserAchievementWithDefinition => ({
  ...userAchievement,
  achievement: {
    ...achievementDefinition,
    name: userAchievement.achievement.name,
  },
});
