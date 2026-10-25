import type { AchievementInAchievement } from "#src/schema/achievement/achievementsInAchievement";
import type { UserAchievementInAchievement } from "#src/schema/achievement/userAchievementsInAchievement";

export type UserAchievementInAchievementWithRelations = UserAchievementInAchievement & {
  achievement: AchievementInAchievement;
};
