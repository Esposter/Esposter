import { MODERATION_NOTE_MAX_LENGTH, moderationNoteEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export const createModerationNoteInputSchema = z.object({
  ...roomIdSchema.shape,
  note: z.string().transform(normalizeString).pipe(z.string().min(1).max(MODERATION_NOTE_MAX_LENGTH)),
  ...moderationNoteEntitySchema.pick({ targetUserId: true }).shape,
});
export type CreateModerationNoteInput = z.infer<typeof createModerationNoteInputSchema>;
