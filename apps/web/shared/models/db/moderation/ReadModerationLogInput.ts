import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { moderationLogEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationLogInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(moderationLogEntitySchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
  // "" = unfiltered: the client sends it for a filter it has not set, and it is read as absent here
  // The router tests each filter for presence and never matches on the sentinel itself
  actorUserId: moderationLogEntitySchema.shape.actorUserId.or(z.literal("")).transform((value) => value || undefined),
  targetUserId: moderationLogEntitySchema.shape.targetUserId.or(z.literal("")).transform((value) => value || undefined),
  type: moderationLogEntitySchema.shape.type.or(z.literal("")).transform((value) => value || undefined),
});
export type ReadModerationLogInput = z.infer<typeof readModerationLogInputSchema>;
