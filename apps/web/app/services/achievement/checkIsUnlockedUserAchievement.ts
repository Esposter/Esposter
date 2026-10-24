import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

// A row exists from the first progress increment, so unlocked is the timestamp being set — never the row's presence
export const checkIsUnlockedUserAchievement = (
  userAchievement: Pick<UserAchievementWithDefinition, "unlockedAt"> | undefined,
): userAchievement is { unlockedAt: Date } => userAchievement !== undefined && userAchievement.unlockedAt !== null;
