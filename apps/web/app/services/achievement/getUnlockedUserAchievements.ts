import type { UserAchievementWithDefinition } from "#src/models/achievement/UserAchievementWithDefinition";

import { checkIsUnlockedUserAchievement } from "#src/services/achievement/checkIsUnlockedUserAchievement";

export const getUnlockedUserAchievements = (userAchievements: UserAchievementWithDefinition[]) =>
  userAchievements.filter((userAchievement) => checkIsUnlockedUserAchievement(userAchievement));
