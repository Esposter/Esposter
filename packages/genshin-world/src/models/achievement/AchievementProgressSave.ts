import { MAX_ACHIEVEMENT_COUNT, MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// Each achievement's progress by its id, as AchievementProgress holds it, with the moment it was finished as an ISO string
export const achievementProgressSaveSchema = z
  .record(
    z.string().min(1).max(MAX_SAVE_ID_LENGTH),
    z.object({ count: z.int().nonnegative(), finishedAt: z.iso.datetime().optional() }),
  )
  .refine((progressMap) => Object.keys(progressMap).length <= MAX_ACHIEVEMENT_COUNT, "Too many achievements");

export type AchievementProgressSave = z.infer<typeof achievementProgressSaveSchema>;
