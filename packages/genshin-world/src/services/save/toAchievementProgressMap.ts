import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { AchievementProgressSave } from "#src/models/achievement/AchievementProgressSave";

// Each achievement's progress read from its save, its id read back from its key and its finish moment from its ISO string
export const toAchievementProgressMap = (
  achievementProgressSave: AchievementProgressSave,
): Map<number, AchievementProgress> =>
  new Map(
    Object.entries(achievementProgressSave).map(([achievementId, { count, finishedAt }]) => [
      Number(achievementId),
      finishedAt === undefined ? { count } : { count, finishedAt: Temporal.Instant.from(finishedAt) },
    ]),
  );
