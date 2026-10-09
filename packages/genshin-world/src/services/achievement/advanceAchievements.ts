import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";

import { AchievementTriggerEventKindMap } from "#src/services/achievement/AchievementTriggerEventKindMap";
import { checkIsAchievementFinished } from "#src/services/achievement/checkIsAchievementFinished";

// What a doing does to the achievements: each one whose watched trigger takes this kind of event and names its target
// Counts it once more, up to its count, once the tier before it is done. An achievement already finished never moves.
// The Primogems of those finished now are returned to be paid, and the progress is held as a new map
export const advanceAchievements = (
  achievements: readonly Achievement[],
  progressMap: ReadonlyMap<number, AchievementProgress>,
  event: AchievementEvent,
  now: Temporal.Instant,
): { primogems: number; progressMap: Map<number, AchievementProgress> } => {
  const nextProgressMap = new Map(progressMap);
  let primogems = 0;
  for (const achievement of achievements) {
    const isWatching =
      AchievementTriggerEventKindMap[achievement.trigger.type] === event.kind &&
      achievement.trigger.parameters.includes(event.targetId);
    const isTierDone =
      achievement.preStageAchievementId === 0 ||
      checkIsAchievementFinished(achievement.preStageAchievementId, nextProgressMap);
    if (!isWatching || !isTierDone || checkIsAchievementFinished(achievement.id, nextProgressMap)) continue;
    const count = Math.min((nextProgressMap.get(achievement.id)?.count ?? 0) + 1, achievement.progress);
    if (count < achievement.progress) nextProgressMap.set(achievement.id, { count });
    else {
      nextProgressMap.set(achievement.id, { count, finishedAt: now });
      primogems += achievement.primogems;
    }
  }
  return { primogems, progressMap: nextProgressMap };
};
