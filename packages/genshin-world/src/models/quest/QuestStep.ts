import type { QuestObjective } from "#src/models/quest/QuestObjective";

import { questObjectiveSchema } from "#src/models/quest/QuestObjective";
import { z } from "zod";

// One step of a quest: the line the tracker and the quest screen show for it by text id ("Talk to Paimon"), and the
// Objectives that all have to be done before the quest moves on
export interface QuestStep {
  id: string;
  objectives: QuestObjective[];
  textId: string;
}

export const questStepSchema = z.object({
  id: z.string().min(1),
  objectives: z.array(questObjectiveSchema).min(1),
  textId: z.string().min(1),
}) satisfies z.ZodType<QuestStep>;
