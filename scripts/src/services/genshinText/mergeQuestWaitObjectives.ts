import type { QuestObjective } from "genshin-world";

import { QuestObjectiveKind } from "genshin-world";

// A step's wait objectives as one, at the place of the first, with every window any of them names. The game's ticks of a
// Step are alternatives (a step to look for someone at an hour lists a tick for each hour they may be found), so they
// Are met by any one window and not by all
export const mergeQuestWaitObjectives = (objectives: QuestObjective[]): QuestObjective[] => {
  const waitObjectives = objectives.filter(({ kind }) => kind === QuestObjectiveKind.Wait);
  const [firstWaitObjective] = waitObjectives;
  if (!firstWaitObjective) return objectives;
  const targetIds = waitObjectives.flatMap((waitObjective) => waitObjective.targetIds);
  return objectives.flatMap((objective) => {
    if (objective.kind !== QuestObjectiveKind.Wait) return [objective];
    return objective === firstWaitObjective ? [{ ...firstWaitObjective, targetIds }] : [];
  });
};
