import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { UPDATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { PublicUserColumns, roomIdSchema, selectUserInAuthSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMembersInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectUserInAuthSchema.pick(PublicUserColumns).keyof(), [
    UPDATED_AT_DESCENDING_SORT_ITEM,
  ]).shape,
  filter: selectUserInAuthSchema.pick({ name: true }).optional(),
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;
