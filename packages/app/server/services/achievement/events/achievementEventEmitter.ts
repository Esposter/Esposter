import type { UserAchievementWithRelations } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface AchievementEvents {
  updateAchievement: UserAchievementWithRelations[];
}

export const achievementEventEmitter = new EventEmitter<AchievementEvents>();
