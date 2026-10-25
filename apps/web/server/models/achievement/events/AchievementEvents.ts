import type { UserAchievementInAchievementWithRelations } from "@esposter/db-schema";

export interface AchievementEvents {
  updateAchievement: [UserAchievementInAchievementWithRelations[]];
}
