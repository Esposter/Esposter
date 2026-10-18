import type { QuestObjective } from "#src/models/quest/QuestObjective";
import type { QuestState } from "#src/models/quest/QuestState";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { checkIsQuestWaitReached } from "#src/services/quest/checkIsQuestWaitReached";
import { parseQuestWaitTargetId } from "#src/services/quest/parseQuestWaitTargetId";

// The target the world's state meets an objective with, undefined where it does not or where the objective is a doing's:
// A plot is met at once by its own target, a scene by the scene the player is in when it names it, and a wait by the
// First window its days and hours have reached
export const getQuestStateTargetId = (
  { kind, targetIds }: QuestObjective,
  { minutes, sceneId }: QuestState,
  elapsedDays: number,
): string | undefined => {
  switch (kind) {
    case QuestObjectiveKind.Plot:
      return targetIds[0];
    case QuestObjectiveKind.Scene:
      return targetIds.find((targetId) => targetId === sceneId);
    case QuestObjectiveKind.Wait:
      return targetIds.find((targetId) => {
        const questWait = parseQuestWaitTargetId(targetId);
        return questWait !== undefined && checkIsQuestWaitReached(questWait, elapsedDays, minutes);
      });
    default:
      return undefined;
  }
};
