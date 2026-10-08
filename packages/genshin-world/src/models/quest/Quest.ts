import type { Talk } from "#src/models/dialogue/Talk";
import type { QuestStep } from "#src/models/quest/QuestStep";

import { talkSchema } from "#src/models/dialogue/Talk";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { questStepSchema } from "#src/models/quest/QuestStep";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A quest by the game's own id: its kind, its title and description by text id, its steps in the order they are done,
// And the talks it runs, which a talk-to objective names
export interface Quest {
  descriptionTextId: string;
  id: string;
  kind: QuestKind;
  steps: QuestStep[];
  talks: Talk[];
  titleTextId: string;
}

// Every talk a talk-to objective names is one the quest runs, so no step waits on a talk that never happens
export const questSchema = z
  .object({
    descriptionTextId: z.string().min(1),
    id: z.string().min(1),
    kind: z.enum(QuestKind) satisfies z.ZodType<QuestKind>,
    steps: createUniqueArraySchema(questStepSchema, "id").min(1),
    talks: createUniqueArraySchema(talkSchema, "id"),
    titleTextId: z.string().min(1),
  })
  .refine(({ steps, talks }) => {
    const talkIds = new Set(talks.map(({ id }) => id));
    return steps
      .flatMap(({ objectives }) => objectives)
      .every(({ kind, targetId }) => kind !== QuestObjectiveKind.TalkTo || talkIds.has(targetId));
  }, "Talk-to objectives must name talks the quest runs") satisfies z.ZodType<Quest>;
