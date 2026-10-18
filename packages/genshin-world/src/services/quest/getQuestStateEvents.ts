import type { Quest } from "#src/models/quest/Quest";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { QuestState } from "#src/models/quest/QuestState";

import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { getQuestStateTargetId } from "#src/services/quest/getQuestStateTargetId";
import { getQuestStepKey } from "#src/services/quest/getQuestStepKey";

// The events the world's own state raises for the quests in progress: one for each objective of a current step that the
// State meets and that is not already met, so an event always moves a quest on and the world never raises one in a loop.
// A wait counts its days from the day its step began
export const getQuestStateEvents = (
  quests: readonly Quest[],
  questProgressMap: ReadonlyMap<string, QuestProgress>,
  questState: QuestState,
  stepStartDays: ReadonlyMap<string, number>,
): QuestEvent[] =>
  quests.flatMap((quest) => {
    const progress = questProgressMap.get(quest.id);
    if (!progress || checkIsQuestFinished(quest, progress)) return [];
    const elapsedDays =
      questState.days - (stepStartDays.get(getQuestStepKey(quest.id, progress.stepIndex)) ?? questState.days);
    return (quest.steps[progress.stepIndex]?.objectives ?? []).flatMap((objective, index) => {
      if ((progress.objectiveCounts[index] ?? 0) >= objective.count) return [];
      const targetId = getQuestStateTargetId(objective, questState, elapsedDays);
      return targetId === undefined ? [] : [{ kind: objective.kind, targetId }];
    });
  });
