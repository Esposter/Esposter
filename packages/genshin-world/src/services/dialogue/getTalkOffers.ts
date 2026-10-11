import type { TalkOffer } from "#src/models/dialogue/TalkOffer";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { DialogueChoiceIcon } from "genshin-interface";

// The quest talks open to the given characters: each talk the step a quest is on asks to be had and has not had yet,
// Begun on one of them, offered with the mark of its quest's kind and named by its quest's title. Provisional: the
// Title stands for the reply's words, which no published source shows
export const getTalkOffers = (
  quests: readonly Quest[],
  questProgressMap: ReadonlyMap<string, QuestProgress>,
  npcIds: readonly string[],
): TalkOffer[] =>
  quests.flatMap(({ id, kind, steps, talks, titleTextId }) => {
    const progress = questProgressMap.get(id);
    if (!progress) return [];
    return (steps[progress.stepIndex]?.objectives ?? []).flatMap(
      ({ count, kind: objectiveKind, targetId }, index): TalkOffer[] => {
        if (objectiveKind !== QuestObjectiveKind.TalkTo || (progress.objectiveCounts[index] ?? 0) >= count) return [];
        const talk = talks.find((questTalk) => questTalk.id === targetId);
        if (!talk?.npcIds.some((npcId) => npcIds.includes(npcId))) return [];
        return [
          {
            icon: kind === QuestKind.Story ? DialogueChoiceIcon.StoryQuest : DialogueChoiceIcon.Quest,
            talkId: talk.id,
            textId: titleTextId,
          },
        ];
      },
    );
  });
