import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";

// The doings a quest's progress moving on hands the achievements: each step it moved past finishes a sub-quest, and a
// Quest its last step finishes finishes the main quest it is filed under, once
export const getFinishedQuestEvents = (
  quest: Quest,
  progress: QuestProgress,
  nextProgress: QuestProgress,
): AchievementEvent[] => {
  const finishedSteps = quest.steps.slice(progress.stepIndex, nextProgress.stepIndex);
  const isMainQuestFinished = checkIsQuestFinished(quest, nextProgress) && !checkIsQuestFinished(quest, progress);
  return [
    ...finishedSteps.map(({ id }) => ({ kind: AchievementEventKind.QuestFinished, targetId: id })),
    ...(isMainQuestFinished ? [{ kind: AchievementEventKind.ParentQuestFinished, targetId: quest.id }] : []),
  ];
};
