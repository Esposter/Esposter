import type { Achievement, UserAchievement } from "@esposter/db-schema";

import { achievementDefinitions } from "@@/server/services/achievement/achievementDefinitions";

export interface UserAchievementWithDefinition extends UserAchievement {
  achievement: (typeof achievementDefinitions)[number] & Achievement;
}
