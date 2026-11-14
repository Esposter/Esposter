import { roomIdSchema, selectUserInAuthSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationNotesCountInputSchema = z.object({
  ...roomIdSchema.shape,
  targetUserId: selectUserInAuthSchema.shape.id,
});
export type ReadModerationNotesCountInput = z.infer<typeof readModerationNotesCountInputSchema>;
