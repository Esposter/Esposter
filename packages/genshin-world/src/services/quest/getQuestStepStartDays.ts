import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { getQuestStepKey } from "#src/services/quest/getQuestStepKey";

// The day each quest's current step began, as the world saw it: a step already seen keeps its day, one new to the world
// Begins on the day it is first seen, and a step the quest has moved past, or a finished quest's, is dropped
export const getQuestStepStartDays = (
  quests: readonly Quest[],
  questProgressMap: ReadonlyMap<string, QuestProgress>,
  days: number,
  previousStepStartDays: ReadonlyMap<string, number>,
): Map<string, number> => {
  const stepStartDays = new Map<string, number>();
  for (const quest of quests) {
    const progress = questProgressMap.get(quest.id);
    if (!progress || checkIsQuestFinished(quest, progress)) continue;
    const key = getQuestStepKey(quest.id, progress.stepIndex);
    stepStartDays.set(key, previousStepStartDays.get(key) ?? days);
  }
  return stepStartDays;
};
