import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM, ID_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { roomIdSchema, selectModerationLogInMessageSchema, selectUserInAuthSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationLogInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectModerationLogInMessageSchema.keyof(), [
    CREATED_AT_DESCENDING_SORT_ITEM,
    ID_DESCENDING_SORT_ITEM,
  ]).omit({ sortBy: true }).shape,
  // "" = unfiltered: the client sends it for a filter it has not set, and the router skips a filter by truthiness
  actorUserId: selectUserInAuthSchema.shape.id.or(z.literal("")),
  targetUserId: selectUserInAuthSchema.shape.id.or(z.literal("")),
  type: selectModerationLogInMessageSchema.shape.type.or(z.literal("")),
});
export type ReadModerationLogInput = z.infer<typeof readModerationLogInputSchema>;
