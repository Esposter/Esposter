import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { moderationNoteEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationNotesInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(moderationNoteEntitySchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
  ...moderationNoteEntitySchema.pick({ targetUserId: true }).shape,
});
export type ReadModerationNotesInput = z.infer<typeof readModerationNotesInputSchema>;
