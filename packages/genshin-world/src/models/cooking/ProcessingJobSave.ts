import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// A processing's queue as the save holds it: how many units are queued and the moment the first of them began, as its ISO
// String, which is read back into the queue's Temporal instant when the save loads
export const processingJobSaveSchema = z.object({
  count: z.int().positive(),
  startedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
});

export type ProcessingJobSave = z.infer<typeof processingJobSaveSchema>;
