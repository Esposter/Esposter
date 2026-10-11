import type { Quest } from "#src/models/quest/Quest";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";

// The Archon quests start one after another from the prologue's first: the first one not yet finished starts once the
// Ones before it are done. Every other quest starts when a talk offering it ends, the quest event the world records
// For it, at its first shown step
export const startQuests = (
  quests: readonly Quest[],
  progressMap: ReadonlyMap<string, QuestProgress>,
  questEvent?: QuestEvent,
): Map<string, QuestProgress> => {
  const nextProgressMap = new Map(progressMap);
  const nextArchonQuest = quests.find(
    (quest) => quest.kind === QuestKind.Archon && !checkIsQuestFinished(quest, progressMap.get(quest.id)),
  );
  if (nextArchonQuest && !progressMap.has(nextArchonQuest.id))
    nextProgressMap.set(nextArchonQuest.id, { objectiveCounts: [], stepIndex: 0 });
  if (questEvent?.kind !== QuestObjectiveKind.TalkTo) return nextProgressMap;
  for (const { id, offerTalkIds } of quests)
    if (!progressMap.has(id) && offerTalkIds.includes(questEvent.targetId))
      nextProgressMap.set(id, { objectiveCounts: [], stepIndex: 0 });
  return nextProgressMap;
};
