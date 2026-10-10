import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The World Level adjustment as the save holds it: whether it is lowered, and the moment it last changed as an ISO
// String, which is read back into the adjustment's Temporal instant when the save loads
export const worldLevelAdjustmentSaveSchema = z.object({
  changedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH).optional(),
  isLowered: z.boolean(),
});

export type WorldLevelAdjustmentSave = z.infer<typeof worldLevelAdjustmentSaveSchema>;
