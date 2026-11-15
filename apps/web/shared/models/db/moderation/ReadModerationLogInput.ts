import {
  createPageInputSchema,
  MODERATION_LOG_PAGE_SORT,
  roomIdSchema,
  selectModerationLogInMessageSchema,
  selectUserInAuthSchema,
} from "@esposter/db-schema";
import { z } from "zod";

export const readModerationLogInputSchema = createPageInputSchema(MODERATION_LOG_PAGE_SORT).extend({
  ...roomIdSchema.shape,
  // "" = unfiltered: the client sends it for a filter it has not set, and the router skips a filter by truthiness
  actorUserId: selectUserInAuthSchema.shape.id.or(z.literal("")),
  targetUserId: selectUserInAuthSchema.shape.id.or(z.literal("")),
  type: selectModerationLogInMessageSchema.shape.type.or(z.literal("")),
});
export type ReadModerationLogInput = z.infer<typeof readModerationLogInputSchema>;
