import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { roomIdSchema, selectBanInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readBansInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectBanInMessageSchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
});
export type ReadBansInput = z.infer<typeof readBansInputSchema>;
