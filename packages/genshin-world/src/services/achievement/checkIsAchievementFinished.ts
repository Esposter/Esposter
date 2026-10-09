import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";

// Whether an achievement is finished, the moment it was finished being the one thing its progress holds once it is
export const checkIsAchievementFinished = (
  achievementId: number,
  progressMap: ReadonlyMap<number, AchievementProgress>,
): boolean => progressMap.get(achievementId)?.finishedAt !== undefined;
