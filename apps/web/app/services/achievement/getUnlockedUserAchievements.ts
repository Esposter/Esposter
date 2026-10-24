import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { checkIsUnlockedUserAchievement } from "@/services/achievement/checkIsUnlockedUserAchievement";

export const getUnlockedUserAchievements = (userAchievements: UserAchievementWithDefinition[]) =>
  userAchievements.filter((userAchievement) => checkIsUnlockedUserAchievement(userAchievement));
