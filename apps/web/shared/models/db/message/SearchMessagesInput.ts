import { checkIsSearchQueryEmpty } from "#shared/services/message/checkIsSearchQueryEmpty";
import {
  decodePageCursor,
  encodedPageCursorSchema,
  filterSchema,
  FilterType,
  getRoomSearchPageSort,
  pageLimitSchema,
  roomIdSchema,
  selectSearchHistoryInMessageSchema,
} from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

// The order a search reads in depends on its query, so its cursor is parsed for that order at the boundary: a cursor the
// Search did not issue for it is a bad request
export const searchMessagesInputSchema = z
  .object({
    cursor: encodedPageCursorSchema,
    // Not unique by type: each filter is one condition, so two `has:` or two `from:` narrow together, and
    // `getSearchableFilters` is what drops an exact repeat on either side of the wire
    filters: filterSchema.array().max(MAX_READ_LIMIT).default([]),
    limit: pageLimitSchema,
    query: selectSearchHistoryInMessageSchema.shape.query,
    ...roomIdSchema.shape,
  })
  .refine(({ filters, query }) => !checkIsSearchQueryEmpty(query, filters), {
    error: "A search needs either text or a filter",
  })
  // An `in:` filter names a room, so its value is a room id and nothing else, or a search would read rooms it did not name
  .refine(({ filters }) => filters.every(({ type, value }) => type !== FilterType.In || typeof value === "string"), {
    error: "An in: filter names a room",
  })
  .transform((search, context) => {
    const cursor = decodePageCursor(search.cursor, getRoomSearchPageSort(search.query));
    if (!cursor) {
      context.addIssue({ code: "custom", message: "Invalid cursor", path: ["cursor"] });
      return z.NEVER;
    }
    return { ...search, cursor };
  });
export type SearchMessagesInput = z.infer<typeof searchMessagesInputSchema>;
