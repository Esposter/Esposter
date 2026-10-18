import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";

// The doings a quest's progress moving on hands the achievements: each step it moved past finishes a sub-quest, and a
// Main quest its last step finishes finishes once, under its id. A Reputation request is filed under a parent it does
// Not share an id with, so finishing it finishes no main quest: that parent's last sub quest is another one
export const getFinishedQuestEvents = (
  quest: Quest,
  progress: QuestProgress,
  nextProgress: QuestProgress,
): AchievementEvent[] => {
  const finishedSteps = quest.steps.slice(progress.stepIndex, nextProgress.stepIndex);
  const isMainQuestFinished =
    quest.mainId === quest.id && checkIsQuestFinished(quest, nextProgress) && !checkIsQuestFinished(quest, progress);
  return [
    ...finishedSteps.map(({ id }) => ({ kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: id })),
    ...(isMainQuestFinished
      ? [{ kind: AchievementEventKind.ParentQuestFinished, quantity: 1, targetId: quest.mainId }]
      : []),
  ];
};
