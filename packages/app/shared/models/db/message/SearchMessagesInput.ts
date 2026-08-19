import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import {
  filterSchema,
  roomIdSchema,
  selectSearchHistoryInMessageSchema,
  standardMessageEntitySchema,
} from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const searchMessagesInputSchema = z
  .object({
    ...roomIdSchema.shape,
    ...createOffsetPaginationParamsSchema(standardMessageEntitySchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).shape,
    // Not unique by type: Azure Search takes one clause per filter, so two `has:` or two `from:` narrow together,
    // And `getSearchableFilters` is what drops an exact repeat on either side of the wire
    filters: filterSchema.array().max(MAX_READ_LIMIT).default([]),
    query: selectSearchHistoryInMessageSchema.shape.query,
  })
  .refine(({ filters, query }) => !getIsSearchQueryEmpty(query, filters));
export type SearchMessagesInput = z.infer<typeof searchMessagesInputSchema>;
