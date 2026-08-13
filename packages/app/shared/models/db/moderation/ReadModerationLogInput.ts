import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { moderationLogEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationLogInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(moderationLogEntitySchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
  // "" = unfiltered — the client's empty-string sentinel propagates end-to-end; the server truthiness-guards
  ...moderationLogEntitySchema.pick({ actorUserId: true, targetUserId: true }).shape,
  type: moderationLogEntitySchema.shape.type.or(z.literal("")),
});
export type ReadModerationLogInput = z.infer<typeof readModerationLogInputSchema>;
