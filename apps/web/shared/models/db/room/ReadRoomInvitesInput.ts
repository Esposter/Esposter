import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { roomIdSchema, selectInviteInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readRoomInvitesInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectInviteInMessageSchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
});
export type ReadRoomInvitesInput = z.infer<typeof readRoomInvitesInputSchema>;
