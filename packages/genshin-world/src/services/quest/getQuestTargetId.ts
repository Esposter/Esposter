import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { QUEST_STATE_OBJECTIVE_KINDS } from "#src/services/quest/constants";

// What a quest's current step sends the player to, by its first objective's target that is a place to go: a talk is had
// With the first character the game begins it on, so that character is the target, and a talk begun on no one is its
// Own. "" for a quest past its last step, and for a step the world's own state alone meets, which names no place
export const getQuestTargetId = ({ steps, talks }: Quest, progress?: QuestProgress): string => {
  const objective = steps[progress?.stepIndex ?? 0]?.objectives.find(
    ({ kind }) => !QUEST_STATE_OBJECTIVE_KINDS.includes(kind),
  );
  if (!objective) return "";
  const [targetId = ""] = objective.targetIds;
  const talkNpcId =
    objective.kind === QuestObjectiveKind.TalkTo ? talks.find(({ id }) => id === targetId)?.npcIds[0] : undefined;
  return talkNpcId ?? targetId;
};
