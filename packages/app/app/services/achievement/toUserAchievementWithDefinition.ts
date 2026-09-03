import type { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";
import type { AchievementName, UserAchievementWithRelations } from "@esposter/db-schema";

export const toUserAchievementWithDefinition = (
  userAchievement: UserAchievementWithRelations,
  achievementDefinition: (typeof AchievementDefinitionMap)[AchievementName],
): UserAchievementWithDefinition => ({
  ...userAchievement,
  achievement: {
    ...achievementDefinition,
    name: userAchievement.achievement.name,
  },
});
