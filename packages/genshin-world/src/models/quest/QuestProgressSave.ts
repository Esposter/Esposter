import {
  EMPTY_QUEST_PROGRESS_SAVE,
  MAX_OBJECTIVE_COUNT,
  MAX_QUEST_COUNT,
  MAX_SAVE_ID_LENGTH,
} from "#src/services/save/constants";
import { z } from "zod";

// Each carried quest's progress by its id, as QuestProgress holds it
export const questProgressSaveSchema = z
  .record(
    z.string().min(1).max(MAX_SAVE_ID_LENGTH),
    z.object({
      objectiveCounts: z.array(z.int().nonnegative()).max(MAX_OBJECTIVE_COUNT),
      stepIndex: z.int().nonnegative(),
    }),
  )
  .refine((progressMap) => Object.keys(progressMap).length <= MAX_QUEST_COUNT, "Too many quests")
  .prefault(EMPTY_QUEST_PROGRESS_SAVE);

export type QuestProgressSave = z.infer<typeof questProgressSaveSchema>;
