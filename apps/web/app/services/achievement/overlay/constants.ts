import type { UserAchievementWithDefinition } from "#src/models/achievement/UserAchievementWithDefinition";

import { createTable } from "#src/services/shared/overlay/createTable";
import { userAchievementsInAchievement } from "@esposter/db-schema";

// A user achievement row with its definition, held by its user and its achievement
export const userAchievementTable = createTable<typeof userAchievementsInAchievement, UserAchievementWithDefinition>(
  userAchievementsInAchievement,
);
