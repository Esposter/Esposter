import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { moderationLogEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { z } from "zod";

export const readModerationLogInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(moderationLogEntitySchema.keyof(), [
    {
      key: ItemMetadataPropertyNames.createdAt,
      order: SortOrder.Desc,
    },
  ]).omit({ sortBy: true }).shape,
});
export type ReadModerationLogInput = z.infer<typeof readModerationLogInputSchema>;
