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
  // "" = unfiltered — the client's empty-string sentinel propagates end-to-end; the server truthiness-guards
  ...moderationLogEntitySchema.pick({ actorUserId: true, targetUserId: true }).shape,
  type: moderationLogEntitySchema.shape.type.or(z.literal("")),
});
export type ReadModerationLogInput = z.infer<typeof readModerationLogInputSchema>;
