import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { roomIdSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

// Azure Table Storage has no real sorting; messages are insert-sorted via a reverse-ticked timestamp rowKey.
// The default sortBy stands in because cursor pagination always requires one
export const readMessagesInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(standardMessageEntitySchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).shape,
    filter: standardMessageEntitySchema.pick({ isPinned: true }).optional(),
    isIncludeValue: z.literal(true).optional(),
    order: z.literal(SortOrder.Asc).optional(),
    ...roomIdSchema.shape,
  })
  .omit({ sortBy: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;
