import {
  createNameSchema,
  MODERATION_NOTE_MAX_LENGTH,
  moderationNoteEntitySchema,
  roomIdSchema,
} from "@esposter/db-schema";
import { z } from "zod";

export const createModerationNoteInputSchema = z.object({
  ...roomIdSchema.shape,
  // Not the entity's own note schema: an Azure Table string field tolerates "", and a note created empty says
  // Nothing the log did not already record
  note: createNameSchema(MODERATION_NOTE_MAX_LENGTH),
  ...moderationNoteEntitySchema.pick({ targetUserId: true }).shape,
});
export type CreateModerationNoteInput = z.infer<typeof createModerationNoteInputSchema>;
