import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { moderationLogEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationLogInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(moderationLogEntitySchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
  // "" = unfiltered: the client sends it for a filter it has not set, and the router skips a filter by truthiness
  actorUserId: moderationLogEntitySchema.shape.actorUserId.or(z.literal("")),
  targetUserId: moderationLogEntitySchema.shape.targetUserId.or(z.literal("")),
  type: moderationLogEntitySchema.shape.type.or(z.literal("")),
});
export type ReadModerationLogInput = z.infer<typeof readModerationLogInputSchema>;
