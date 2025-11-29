import type { UserAchievement } from "@esposter/db-schema";

import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";

export interface UserAchievementWithDefinition extends UserAchievement {
  achievement: (typeof achievementDefinitions)[number];
}
