import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { ID_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { selectSearchHistoryInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readSearchHistoriesInputSchema = z.object({
  ...createCursorPaginationParamsSchema(selectSearchHistoryInMessageSchema.keyof(), [ID_DESCENDING_SORT_ITEM]).shape,
  roomId: selectSearchHistoryInMessageSchema.shape.roomId,
});
export type ReadSearchHistoriesInput = z.infer<typeof readSearchHistoriesInputSchema>;
