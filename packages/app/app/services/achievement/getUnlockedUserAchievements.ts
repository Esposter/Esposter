import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

// A row exists from the first progress increment, so unlocked is the timestamp being set — never the row's presence
export const getUnlockedUserAchievements = (userAchievements: UserAchievementWithDefinition[]) =>
  userAchievements.filter(({ unlockedAt }) => unlockedAt !== null);
