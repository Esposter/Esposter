import { numericSaveIdSchema } from "#src/models/save/numericSaveIdSchema";
import { MAX_ACHIEVEMENT_COUNT, MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// Each achievement's progress by its id, as AchievementProgress holds it, with the moment it was finished as an ISO string
export const achievementProgressSaveSchema = createRecordSchema(
  numericSaveIdSchema,
  z.object({ count: z.int().nonnegative(), finishedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH).optional() }),
  MAX_ACHIEVEMENT_COUNT,
);

export type AchievementProgressSave = z.infer<typeof achievementProgressSaveSchema>;
