import { moderationNoteEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationNotesCountInputSchema = z.object({
  ...roomIdSchema.shape,
  ...moderationNoteEntitySchema.pick({ targetUserId: true }).shape,
});
export type ReadModerationNotesCountInput = z.infer<typeof readModerationNotesCountInputSchema>;
