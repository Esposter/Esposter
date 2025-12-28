import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import {
  filterSchema,
  selectRoomSchema,
  selectSearchHistorySchema,
  standardMessageEntitySchema,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { z } from "zod";

export const searchMessagesInputSchema = z
  .object({
    ...createOffsetPaginationParamsSchema(standardMessageEntitySchema.keyof(), 0, [
      { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
    ]).shape,
    filters: filterSchema.array().max(MAX_READ_LIMIT).default([]),
    query: selectSearchHistorySchema.shape.query,
    roomId: selectRoomSchema.shape.id,
  })
  .refine(({ filters, query }) => !getIsSearchQueryEmpty(query, filters));
export type SearchMessagesInput = z.infer<typeof searchMessagesInputSchema>;
