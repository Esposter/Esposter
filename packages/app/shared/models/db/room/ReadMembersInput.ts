import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { UPDATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { roomIdSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMembersInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectUserSchema.keyof(), [UPDATED_AT_DESCENDING_SORT_ITEM]).shape,
  filter: selectUserSchema.pick({ name: true }).optional(),
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;
