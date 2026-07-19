import { moderationNoteEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const countModerationNotesInputSchema = z.object({
  ...roomIdSchema.shape,
  ...moderationNoteEntitySchema.pick({ targetUserId: true }).shape,
});
export type CountModerationNotesInput = z.infer<typeof countModerationNotesInputSchema>;
