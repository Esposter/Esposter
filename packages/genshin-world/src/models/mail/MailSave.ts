import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// A mail the player holds as the save keeps it: its id in the game's mail table, when it was delivered as an ISO string,
// Whether its attachments were claimed and its text read, and whether the player pinned it to the top of the list. A
// Save written before the pin has no isPinned key, so its backfill sets it false on every held mail
export const mailSaveSchema = z.object({
  deliveredAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
  id: z.int().positive(),
  isClaimed: z.boolean(),
  isPinned: z.boolean(),
  isRead: z.boolean(),
});

export type MailSave = z.infer<typeof mailSaveSchema>;
