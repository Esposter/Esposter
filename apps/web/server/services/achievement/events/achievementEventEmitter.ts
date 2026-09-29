import type { UserAchievementInAchievementWithRelations } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface AchievementEvents {
  updateAchievement: [UserAchievementInAchievementWithRelations[]];
}

export const achievementEventEmitter = new EventEmitter<AchievementEvents>();
