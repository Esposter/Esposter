import type { Quest } from "#src/models/quest/Quest";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

// What the Traveler's doing does to a quest: each objective of the current step the event names is met once more, up
// To its count, and once every objective is done the quest moves on to its next step with nothing met. A finished
// Quest, and an event no objective names, leave it where it was
export const advanceQuest = (quest: Quest, progress: QuestProgress, questEvent: QuestEvent): QuestProgress => {
  const questStep = quest.steps[progress.stepIndex];
  if (!questStep) return progress;
  const objectiveCounts = questStep.objectives.map((objective, index) => {
    const objectiveCount = progress.objectiveCounts[index] ?? 0;
    return objective.kind === questEvent.kind && objective.targetId === questEvent.targetId
      ? Math.min(objectiveCount + 1, objective.count)
      : objectiveCount;
  });
  const isStepDone = questStep.objectives.every(({ count }, index) => objectiveCounts[index] === count);
  return isStepDone ? { objectiveCounts: [], stepIndex: progress.stepIndex + 1 } : { ...progress, objectiveCounts };
};
