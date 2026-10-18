import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { QuestStep } from "#src/models/quest/QuestStep";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";

// The targets of a step's Interact objectives, which name a transport point by its scene point
const getInteractTargetIds = ({ objectives }: QuestStep) =>
  objectives.filter(({ kind }) => kind === QuestObjectiveKind.Interact).flatMap(({ targetIds }) => targetIds);

// The steps a quest has reached: all of a finished quest's, those up to and including the current one of a quest in
// Progress, and none of a quest not started
const getReachedSteps = (quest: Quest, progress: QuestProgress | undefined) => {
  if (!progress) return [];
  if (checkIsQuestFinished(quest, progress)) return quest.steps;
  return quest.steps.slice(0, progress.stepIndex + 1);
};

// The Interact targets the quests name, every step's as named and those of the steps a quest has reached as reached. A step
// Still ahead of a quest in progress names its target without reaching it, which is how a transport point stays hidden
// Until its step is carried
export const computeQuestStepTargets = (
  quests: readonly Quest[],
  questProgressMap: ReadonlyMap<string, QuestProgress>,
): { named: ReadonlySet<string>; reached: ReadonlySet<string> } => {
  const named = new Set<string>();
  const reached = new Set<string>();
  for (const quest of quests) {
    for (const step of quest.steps) for (const targetId of getInteractTargetIds(step)) named.add(targetId);
    for (const step of getReachedSteps(quest, questProgressMap.get(quest.id)))
      for (const targetId of getInteractTargetIds(step)) reached.add(targetId);
  }
  return { named, reached };
};
