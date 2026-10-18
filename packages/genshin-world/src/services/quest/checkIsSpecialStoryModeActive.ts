import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

// Whether a quest in progress is on a step Special Story Mode restricts, which keeps the Paimon menu shut. Only the step
// The player is on counts, since the restriction ends with the step
export const checkIsSpecialStoryModeActive = (
  quests: readonly Pick<Quest, "id" | "steps">[],
  questProgressMap: ReadonlyMap<string, QuestProgress>,
): boolean =>
  quests.some((quest) => {
    const progress = questProgressMap.get(quest.id);
    return progress !== undefined && quest.steps[progress.stepIndex]?.banType !== undefined;
  });
