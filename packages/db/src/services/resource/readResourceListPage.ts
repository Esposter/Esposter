import type { getResourceSearchHits } from "#src/services/resource/getResourceSearchHits";
import type { Database, PageCursor, PageSort, ResourceListColumnKey } from "@esposter/db-schema";
import type { SQL, SQLWrapper } from "drizzle-orm";

import { createPageSort } from "#src/services/pagination/createPageSort";
import { getPageOrderBy } from "#src/services/pagination/getPageOrderBy";
import { getPageWhere } from "#src/services/pagination/getPageWhere";
import { toPage } from "#src/services/pagination/toPage";
import { getLastAccessedJoin } from "#src/services/resource/getLastAccessedJoin";
import { getResourceNameSearchMatch } from "#src/services/resource/getResourceNameSearchMatch";
import { resourceListSelection } from "#src/services/resource/resourceListSelection";
import { resourceAccessesInResource, resourceFavoritesInResource, resourcesInResource } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, count, eq, sql } from "drizzle-orm";

interface ReadResourceListPageOptions {
  cursor: PageCursor;
  limit: number;
  // Set when the list is a search: the words' expression, and the index hits that rank each row by bm25
  search?: undefined | { expression: string; hits: ReturnType<typeof getResourceSearchHits> };
  sort: PageSort<ResourceListColumnKey>;
  userId: string;
  where?: SQL | undefined;
}

// One page of the owner's resources in the order the sort declares, with the cursor for the next. The read without a
// Cursor is the first page, and it also answers how many rows the where matches. A search's relevance keys are read off
// Each row so the cursor can continue from the last one, and they are left out of the page. Each row carries the viewer's
// Own star beside it, so a list shows every row's star from the page alone
export const readResourceListPage = async (
  db: Database,
  { cursor, limit, search, sort, userId, where }: ReadResourceListPageOptions,
) => {
  const columns = {
    createdAt: resourcesInResource.createdAt,
    deletedAt: resourcesInResource.deletedAt,
    id: resourcesInResource.id,
    lastAccessedAt: resourceAccessesInResource.accessedAt,
    name: resourcesInResource.name,
    nameMatch: search ? getResourceNameSearchMatch(search.expression) : sql`0`,
    negRank: search ? sql`-${search.hits.rank}` : sql`0`,
    type: resourcesInResource.type,
    updatedAt: resourcesInResource.updatedAt,
  } satisfies Record<ResourceListColumnKey, SQLWrapper>;
  const boundSort = createPageSort(columns, sort);
  // The star is the viewer's row for the resource, tombstones included: a removed star reads as one, so a client applies its removal
  const query = db
    .select({
      ...resourceListSelection,
      favorite: resourceFavoritesInResource,
      nameMatch: columns.nameMatch,
      negRank: columns.negRank,
    })
    .from(resourcesInResource)
    .leftJoin(resourceAccessesInResource, getLastAccessedJoin(userId))
    .leftJoin(
      resourceFavoritesInResource,
      and(
        eq(resourceFavoritesInResource.resourceId, resourcesInResource.id),
        eq(resourceFavoritesInResource.userId, userId),
      ),
    )
    .$dynamic();
  const rows = await (search ? query.leftJoin(search.hits, eq(search.hits.id, resourcesInResource.id)) : query)
    .where(and(where, getPageWhere(boundSort, cursor)))
    .orderBy(...getPageOrderBy(boundSort, cursor))
    .limit(limit + 1);
  const page = toPage(rows, sort, cursor, limit);
  const items = page.items.map(({ nameMatch: _nameMatch, negRank: _negRank, ...item }) => item);
  if (cursor.values.length > 0) return { items, nextCursor: page.nextCursor };

  const total = takeOne(await db.select({ count: count() }).from(resourcesInResource).where(where)).count;
  return { count: total, items, nextCursor: page.nextCursor };
};
