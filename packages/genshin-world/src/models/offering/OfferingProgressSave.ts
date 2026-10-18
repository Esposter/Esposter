import { MAX_OFFERING_ITEM_KIND_COUNT, MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// An offering's progress as the save holds it: the count held of each item toward its next level, by the item's id, and
// The level it has reached. The levels are the game's own, read from the hosted game data, so the save holds only what the
// Player offered, and an item held none of is left out
export const offeringProgressSaveSchema = z.object({
  heldCounts: z
    .record(z.string().min(1).max(MAX_SAVE_ID_LENGTH), z.int().positive())
    .refine((heldCounts) => Object.keys(heldCounts).length <= MAX_OFFERING_ITEM_KIND_COUNT, "Too many items"),
  level: z.int().nonnegative(),
});

export type OfferingProgressSave = z.infer<typeof offeringProgressSaveSchema>;
