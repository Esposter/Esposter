import { MAX_OBJECTIVE_COUNT, MAX_QUEST_COUNT, MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// Each carried quest's progress by its id, as QuestProgress holds it
export const questProgressSaveSchema = createRecordSchema(
  z.string().min(1).max(MAX_SAVE_ID_LENGTH),
  z.object({
    objectiveCounts: z.array(z.int().nonnegative()).max(MAX_OBJECTIVE_COUNT),
    stepIndex: z.int().nonnegative(),
  }),
  MAX_QUEST_COUNT,
);

export type QuestProgressSave = z.infer<typeof questProgressSaveSchema>;
