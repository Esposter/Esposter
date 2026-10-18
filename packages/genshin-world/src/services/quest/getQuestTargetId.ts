import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";

// What a quest's current step sends the player to, by its first objective's target: a talk is had with the first
// Character the game begins it on, so that character is the target, and a talk begun on no one is its own. "" for a
// Quest past its last step
export const getQuestTargetId = ({ steps, talks }: Quest, progress?: QuestProgress): string => {
  const objective = steps[progress?.stepIndex ?? 0]?.objectives[0];
  if (!objective) return "";
  const [targetId = ""] = objective.targetIds;
  const talkNpcId =
    objective.kind === QuestObjectiveKind.TalkTo ? talks.find(({ id }) => id === targetId)?.npcIds[0] : undefined;
  return talkNpcId ?? targetId;
};
