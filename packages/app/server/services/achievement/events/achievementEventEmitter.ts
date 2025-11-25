import type { Achievement, UserAchievement } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface AchievementEvents {
  incrementPoints: UserAchievement & { achievement: Achievement; userId: string }[];
  unlockAchievement: UserAchievement & { achievement: Achievement; userId: string }[];
}

export const achievementEventEmitter = new EventEmitter<AchievementEvents>();
