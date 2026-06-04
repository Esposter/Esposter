import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import {
  filterSchema,
  roomIdSchema,
  selectSearchHistoryInMessageSchema,
  standardMessageEntitySchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema, ItemMetadataPropertyNames, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const searchMessagesInputSchema = z
  .object({
    ...roomIdSchema.shape,
    ...createOffsetPaginationParamsSchema(standardMessageEntitySchema.keyof(), 0, [
      { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
    ]).shape,
    filters: createUniqueArraySchema(filterSchema, "type").max(MAX_READ_LIMIT).default([]),
    query: selectSearchHistoryInMessageSchema.shape.query,
  })
  .refine(({ filters, query }) => !getIsSearchQueryEmpty(query, filters));
export type SearchMessagesInput = z.infer<typeof searchMessagesInputSchema>;
