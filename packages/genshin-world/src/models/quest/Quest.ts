import type { Talk } from "#src/models/dialogue/Talk";
import type { QuestStep } from "#src/models/quest/QuestStep";

import { talkSchema } from "#src/models/dialogue/Talk";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { questStepSchema } from "#src/models/quest/QuestStep";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A quest by the game's own id: its kind, its title and description by text id, its steps in the order they are done,
// And the talks it runs, which a talk-to objective or its offer names
export interface Quest {
  descriptionTextId: string;
  id: string;
  kind: QuestKind;
  // The talks offering the quest, any one of which ending starts it, none for a quest that starts otherwise
  offerTalkIds: string[];
  steps: QuestStep[];
  talks: Talk[];
  titleTextId: string;
}

// Every talk a talk-to objective or the offer names is one the quest runs, so no step waits on a talk that never happens
// And no offer begins one
export const questSchema = z
  .object({
    descriptionTextId: z.string().min(1),
    id: z.string().min(1),
    kind: z.enum(QuestKind) satisfies z.ZodType<QuestKind>,
    offerTalkIds: z.array(z.string().min(1)),
    steps: createUniqueArraySchema(questStepSchema, "id").min(1),
    talks: createUniqueArraySchema(talkSchema, "id"),
    titleTextId: z.string().min(1),
  })
  .refine(({ offerTalkIds, steps, talks }) => {
    const talkIds = new Set(talks.map(({ id }) => id));
    return (
      offerTalkIds.every((talkId) => talkIds.has(talkId)) &&
      steps
        .flatMap(({ objectives }) => objectives)
        .every(({ kind, targetId }) => kind !== QuestObjectiveKind.TalkTo || talkIds.has(targetId))
    );
  }, "Talk-to objectives and offers must name talks the quest runs") satisfies z.ZodType<Quest>;
