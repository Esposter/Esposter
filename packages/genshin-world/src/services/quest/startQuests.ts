import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { QuestKind } from "#src/models/quest/QuestKind";

// The Archon quests start one after another from the prologue's first: the first one not yet finished starts once the
// Ones before it are done, and nothing else starts here, since the other kinds start from the talks that offer them
export const startQuests = (quests: readonly Quest[], progressMap: ReadonlyMap<string, QuestProgress>) => {
  const nextArchonQuest = quests.find(
    (quest) => quest.kind === QuestKind.Archon && !checkIsQuestFinished(quest, progressMap.get(quest.id)),
  );
  if (!nextArchonQuest || progressMap.has(nextArchonQuest.id)) return new Map(progressMap);
  return new Map([...progressMap, [nextArchonQuest.id, { objectiveCounts: [], stepIndex: 0 }]]);
};
