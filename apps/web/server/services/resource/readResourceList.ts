import type { Context } from "#server/trpc/context";
import type { ResourceFilterInput } from "#shared/models/db/resource/ResourceFilterInput";
import type { ResourceListColumnKey } from "#shared/models/resource/ResourceListColumnKey";
import type { ResourceListPage } from "#shared/models/resource/ResourceListPage";
import type { PageCursor, PageSort } from "@esposter/db-schema";

import { getResourceSearchHits } from "#server/services/resource/getResourceSearchHits";
import { getResourcesWhere } from "#server/services/resource/getResourcesWhere";
import { readResourceListPage } from "#server/services/resource/readResourceListPage";
import { getSearchExpression } from "@esposter/shared";

// One page of the owner's resources matching the filter, in the order the sort declares. A search is ordered by how
// Well each row matches: a name match ahead of a row matched only by a tag, then by bm25
export const readResourceList = (
  db: Context["db"],
  userId: string,
  filter: ResourceFilterInput,
  sort: PageSort<ResourceListColumnKey>,
  cursor: PageCursor,
  limit: number,
): Promise<ResourceListPage> => {
  const expression = filter.searchQuery ? getSearchExpression(filter.searchQuery) : "";
  return readResourceListPage(db, {
    cursor,
    limit,
    search: expression ? { expression, hits: getResourceSearchHits(db, expression) } : undefined,
    sort,
    userId,
    where: getResourcesWhere(db, userId, filter),
  });
};
