import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";

import { AchievementTriggerEventKindMap } from "#src/services/achievement/AchievementTriggerEventKindMap";
import { checkIsAchievementFinished } from "#src/services/achievement/checkIsAchievementFinished";

// What a doing does to the achievements: each one whose watched trigger takes this kind of event and names its target
// In the slot that trigger watches counts it, by one or by the event's quantity, up to its count, once the tier before it
// Is done. An achievement already finished never moves. The Primogems of those finished now are returned to be paid, and
// The progress is held as a new map
export const advanceAchievements = (
  achievements: readonly Achievement[],
  progressMap: ReadonlyMap<number, AchievementProgress>,
  event: AchievementEvent,
  now: Temporal.Instant,
): { primogems: number; progressMap: Map<number, AchievementProgress> } => {
  const nextProgressMap = new Map(progressMap);
  let primogems = 0;
  for (const achievement of achievements) {
    const watch = AchievementTriggerEventKindMap[achievement.trigger.type];
    if (watch?.kind !== event.kind) continue;
    // A slot that names no id is an any-target trigger, which takes every doing of its kind
    const namedTargetIds = achievement.trigger.parameters[watch.targetSlot] ?? [];
    const isAnyTarget = namedTargetIds.length === 0;
    if (!isAnyTarget && !namedTargetIds.includes(event.targetId)) continue;
    const isTierDone =
      achievement.preStageAchievementId === 0 ||
      checkIsAchievementFinished(achievement.preStageAchievementId, nextProgressMap);
    if (!isTierDone || checkIsAchievementFinished(achievement.id, nextProgressMap)) continue;
    const progress = nextProgressMap.get(achievement.id);
    const countedTargetIds = progress?.countedTargetIds ?? [];
    const levelSlot = watch.levelSlot;
    const isLevel = levelSlot !== undefined;
    const isCountedOnce = !isLevel && !isAnyTarget && !watch.countsQuantity;
    if (isCountedOnce && countedTargetIds.includes(event.targetId)) continue;
    const target = isLevel ? Number(achievement.trigger.parameters[levelSlot]?.[0]) : achievement.progress;
    if (!Number.isInteger(target) || target <= 0) continue;
    const count = isLevel
      ? Math.min(event.quantity, target)
      : Math.min((progress?.count ?? 0) + (watch.countsQuantity ? event.quantity : 1), target);
    if (count < target)
      nextProgressMap.set(
        achievement.id,
        isCountedOnce ? { count, countedTargetIds: [...countedTargetIds, event.targetId] } : { count },
      );
    else {
      nextProgressMap.set(achievement.id, { count, finishedAt: now });
      primogems += achievement.primogems;
    }
  }
  return { primogems, progressMap: nextProgressMap };
};
