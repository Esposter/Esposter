import type { UserAchievement } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface AchievementEvents {
  incrementPoints: UserAchievement[];
  unlockAchievement: UserAchievement[];
}

export const achievementEventEmitter = new EventEmitter<AchievementEvents>();
