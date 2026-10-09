import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

// A quest is finished once its progress has moved past its last step
export const checkIsQuestFinished = (quest: Quest, progress: QuestProgress | undefined): boolean =>
  progress !== undefined && progress.stepIndex >= quest.steps.length;
