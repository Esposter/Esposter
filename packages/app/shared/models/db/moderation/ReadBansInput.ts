import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { roomIdSchema, selectBanInMessageSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readBansInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectBanInMessageSchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
  // The banned user's name, matching what `readMembers` takes. The reason is deliberately not searched: it is free
  // Text a moderator wrote, and the want the panel serves is whether a person is banned, which is a name
  filter: selectUserSchema.pick({ name: true }).optional(),
});
export type ReadBansInput = z.infer<typeof readBansInputSchema>;
