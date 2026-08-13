import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import {
  filterSchema,
  roomIdSchema,
  selectSearchHistoryInMessageSchema,
  standardMessageEntitySchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const searchMessagesInputSchema = z
  .object({
    ...roomIdSchema.shape,
    ...createOffsetPaginationParamsSchema(standardMessageEntitySchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM]).shape,
    filters: createUniqueArraySchema(filterSchema, "type").max(MAX_READ_LIMIT).default([]),
    // The Files-in-room tab lists every message with an attachment, so an empty text query is valid here.
    hasFiles: z.boolean().optional(),
    query: selectSearchHistoryInMessageSchema.shape.query,
  })
  .refine(({ filters, hasFiles, query }) => Boolean(hasFiles) || !getIsSearchQueryEmpty(query, filters));
export type SearchMessagesInput = z.infer<typeof searchMessagesInputSchema>;
