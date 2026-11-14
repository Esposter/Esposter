import {
  createNameSchema,
  MODERATION_NOTE_MAX_LENGTH,
  roomIdSchema,
  selectUserInAuthSchema,
} from "@esposter/db-schema";
import { z } from "zod";

export const createModerationNoteInputSchema = z.object({
  ...roomIdSchema.shape,
  // Not the row's own note schema: a note created empty says nothing the log did not already record
  note: createNameSchema(MODERATION_NOTE_MAX_LENGTH),
  targetUserId: selectUserInAuthSchema.shape.id,
});
export type CreateModerationNoteInput = z.infer<typeof createModerationNoteInputSchema>;
