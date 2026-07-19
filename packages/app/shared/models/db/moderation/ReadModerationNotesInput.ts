import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { moderationNoteEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { z } from "zod";

export const readModerationNotesInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(moderationNoteEntitySchema.keyof(), [
    {
      key: ItemMetadataPropertyNames.createdAt,
      order: SortOrder.Desc,
    },
  ]).omit({ sortBy: true }).shape,
  ...moderationNoteEntitySchema.pick({ targetUserId: true }).shape,
});
export type ReadModerationNotesInput = z.infer<typeof readModerationNotesInputSchema>;
