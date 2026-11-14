import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { ID_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { roomIdSchema, selectModerationNoteInMessageSchema, selectUserInAuthSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationNotesInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectModerationNoteInMessageSchema.keyof(), [ID_DESCENDING_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
  targetUserId: selectUserInAuthSchema.shape.id,
});
export type ReadModerationNotesInput = z.infer<typeof readModerationNotesInputSchema>;
