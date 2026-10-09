import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { AchievementProgressSave } from "#src/models/achievement/AchievementProgressSave";

// Each achievement's progress as its save holds it, keyed by its id, with the moment it was finished as an ISO string
export const toAchievementProgressSave = (
  achievementProgressMap: ReadonlyMap<number, AchievementProgress>,
): AchievementProgressSave =>
  Object.fromEntries(
    Array.from(achievementProgressMap, ([achievementId, { count, finishedAt }]) => [
      String(achievementId),
      finishedAt === undefined ? { count } : { count, finishedAt: finishedAt.toString() },
    ]),
  );
