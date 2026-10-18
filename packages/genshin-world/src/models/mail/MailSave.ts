import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// A mail the player holds as the save keeps it: its id in the game's mail table, when it was delivered as an ISO string,
// Whether its attachments were claimed and its text read, and whether the player starred it into the Gift Mail Box. An
// Mail never starred has no isStarred key, so a save written before the star reads as unstarred, with no backfill
export const mailSaveSchema = z.object({
  deliveredAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
  id: z.int().positive(),
  isClaimed: z.boolean(),
  isRead: z.boolean(),
  isStarred: z.boolean().optional(),
});

export type MailSave = z.infer<typeof mailSaveSchema>;
