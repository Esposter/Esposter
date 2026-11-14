import type { Context } from "#server/trpc/context";
import type { ResourceFilterInput } from "#shared/models/db/resource/ResourceFilterInput";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListSortKey } from "#shared/models/resource/ResourceListSortKey";

import { parseSortByToSql } from "#server/services/pagination/sorting/parseSortByToSql";
import { getResourceNameSearchMatch } from "#server/services/resource/getResourceNameSearchMatch";
import { getResourceSearchHits } from "#server/services/resource/getResourceSearchHits";
import { getResourcesWhere } from "#server/services/resource/getResourcesWhere";
import { readResourceListPage } from "#server/services/resource/readResourceListPage";
import { resourceListSelection } from "#server/services/resource/resourceListSelection";
import { getSearchExpression } from "@esposter/shared";
import { resourcesInResource } from "@esposter/db-schema";
import { asc, desc } from "drizzle-orm";

// One offset page of the owner's resources matching the filter. A search ranks its matches first: a name match ahead
// of a row matched only by a tag, then by bm25, and only then the order the caller asked for, which defaults to newest
export const readResourceList = (
  db: Context["db"],
  userId: string,
  filter: ResourceFilterInput,
  sortBy: SortItem<ResourceListSortKey>[],
  limit: number,
  offset: number,
) => {
  const where = getResourcesWhere(db, userId, filter);
  const expression = filter.searchQuery ? getSearchExpression(filter.searchQuery) : "";
  const searchHits = expression ? getResourceSearchHits(db, expression) : undefined;
  const orderBy = [
    ...(searchHits ? [desc(getResourceNameSearchMatch(expression)), asc(searchHits.rank)] : []),
    ...(sortBy.length > 0 ? parseSortByToSql(resourceListSelection, sortBy) : [desc(resourcesInResource.updatedAt)]),
  ];
  return readResourceListPage(db, userId, where, orderBy, limit, offset, searchHits);
};
