import type { Quest } from "#src/models/quest/Quest";
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";

// The Archon quests start one after another from the prologue's first: the first one not yet finished starts once the
// Ones before it are done. Every other quest starts when a talk offering it ends, the quest event the world records
// For it, at its first shown step, unless its series orders a quest before it that is not yet finished. A quest with no
// Series, or the first of one, is offered as its talk ends. An accepted quest, a Reputation request the keeper's board
// Offers, starts at its first step once, if it is carried and has not started
export const startQuests = (
  quests: readonly Quest[],
  progressMap: ReadonlyMap<string, QuestProgress>,
  questEvent?: QuestEvent,
  chapters: readonly QuestChapter[] = [],
  acceptedQuestId?: string,
): Map<string, QuestProgress> => {
  const nextProgressMap = new Map(progressMap);
  const nextArchonQuest = quests.find(
    (quest) => quest.kind === QuestKind.Archon && !checkIsQuestFinished(quest, progressMap.get(quest.id)),
  );
  if (nextArchonQuest && !progressMap.has(nextArchonQuest.id))
    nextProgressMap.set(nextArchonQuest.id, { objectiveCounts: [], stepIndex: 0 });
  if (
    acceptedQuestId !== undefined &&
    !progressMap.has(acceptedQuestId) &&
    quests.some(({ id }) => id === acceptedQuestId)
  )
    nextProgressMap.set(acceptedQuestId, { objectiveCounts: [], stepIndex: 0 });
  // A quest whose parent quests are all finished starts, at load and on any event, since a step's quest event can finish one. A
  // Parent the world does not carry never finishes, so its child stays unstarted
  const checkIsParentQuestFinished = (parentQuestId: string) => {
    const parentQuest = quests.find(({ id }) => id === parentQuestId);
    return parentQuest !== undefined && checkIsQuestFinished(parentQuest, progressMap.get(parentQuestId));
  };
  for (const { id, parentQuestIds } of quests) {
    if (progressMap.has(id) || parentQuestIds.length === 0) continue;
    if (parentQuestIds.every((parentQuestId) => checkIsParentQuestFinished(parentQuestId)))
      nextProgressMap.set(id, { objectiveCounts: [], stepIndex: 0 });
  }
  if (questEvent?.kind !== QuestObjectiveKind.TalkTo) return nextProgressMap;
  // The quest each of a series' quests after its first is ordered after
  const previousQuestIdMap = new Map(
    chapters.flatMap(({ questIds }) =>
      questIds.flatMap((questId, index) => {
        const previousQuestId = questIds[index - 1];
        return previousQuestId === undefined ? [] : [[questId, previousQuestId] as const];
      }),
    ),
  );
  for (const { id, offerTalkIds } of quests) {
    if (progressMap.has(id) || !offerTalkIds.includes(questEvent.targetId)) continue;
    const previousQuestId = previousQuestIdMap.get(id);
    if (previousQuestId !== undefined) {
      const previousQuest = quests.find(({ id: questId }) => questId === previousQuestId);
      if (!previousQuest || !checkIsQuestFinished(previousQuest, progressMap.get(previousQuestId))) continue;
    }
    nextProgressMap.set(id, { objectiveCounts: [], stepIndex: 0 });
  }
  return nextProgressMap;
};
