import { resourceFilterInputSchema } from "#shared/models/db/resource/ResourceFilterInput";
import { resourceListSortNameSchema } from "#shared/models/resource/ResourceListSortName";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { checkIsSortNameAvailable } from "#shared/services/resource/checkIsSortNameAvailable";
import { ResourceSortNamePageSortMap } from "#shared/services/resource/ResourceSortNamePageSortMap";
import { decodePageCursor, encodedPageCursorSchema, pageLimitSchema } from "@esposter/db-schema";
import { z } from "zod";

// The owner's resources a page at a time. A search is ordered by relevance and nothing else, and only a search is, so
// The sort name says which order the page is in
export const readResourceListInputSchema = z
  .object({
    ...resourceFilterInputSchema.shape,
    cursor: encodedPageCursorSchema,
    limit: pageLimitSchema,
    sortName: resourceListSortNameSchema.optional(),
  })
  .transform(({ cursor, limit, sortName, ...filter }, context) => {
    const isSearching = Boolean(filter.searchQuery);
    const resolvedSortName = sortName ?? (isSearching ? ResourceSortName.Relevance : ResourceSortName.UpdatedAtDesc);
    if ((resolvedSortName === ResourceSortName.Relevance) !== isSearching) {
      context.addIssue({
        code: "custom",
        message: "A search is ordered by relevance, and only a search is",
        path: ["sortName"],
      });
      return z.NEVER;
    }
    if (!checkIsSortNameAvailable(resolvedSortName, filter.isAccessed)) {
      context.addIssue({
        code: "custom",
        message: "The last-accessed order needs the accessed filter",
        path: ["sortName"],
      });
      return z.NEVER;
    }
    const sort = ResourceSortNamePageSortMap[resolvedSortName];
    const pageCursor = decodePageCursor(cursor, sort);
    if (!pageCursor) {
      context.addIssue({ code: "custom", message: "Invalid cursor", path: ["cursor"] });
      return z.NEVER;
    }
    return { ...filter, cursor: pageCursor, limit, sort, sortName: resolvedSortName };
  });
