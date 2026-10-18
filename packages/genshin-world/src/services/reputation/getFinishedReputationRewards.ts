import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";

import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";

// The Reputation rewards a quest's progress moving on finishes: each bound reward whose quest it is, paid on the move that
// Finishes the quest and never on one from a progress already finished, so a finished quest pays once
export const getFinishedReputationRewards = (
  quest: Quest,
  progress: QuestProgress | undefined,
  nextProgress: QuestProgress,
  bindings: readonly { questId: number; reward: ReputationReward }[],
): ReputationReward[] => {
  const isFinishedNow = checkIsQuestFinished(quest, nextProgress) && !checkIsQuestFinished(quest, progress);
  return isFinishedNow
    ? bindings.filter(({ questId }) => String(questId) === quest.id).map(({ reward }) => reward)
    : [];
};
