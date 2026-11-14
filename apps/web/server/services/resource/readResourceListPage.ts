import type { getResourceSearchHits } from "#server/services/resource/getResourceSearchHits";
import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { getLastAccessedJoin } from "#server/services/resource/getLastAccessedJoin";
import { resourceListSelection } from "#server/services/resource/resourceListSelection";
import { resourceAccessesInResource, resourcesInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// One offset page of the resource list, each row carrying the caller's own last access, in the order the caller gives.
// A search joins its index hits, so the order can rank by bm25. It reads one row past the limit, which is how the page
// Knows there is more
export const readResourceListPage = async (
  db: Context["db"],
  userId: string,
  where: SQL | undefined,
  orderBy: SQL[],
  limit: number,
  offset: number,
  searchHits?: ReturnType<typeof getResourceSearchHits>,
) => {
  const query = db
    .select(resourceListSelection)
    .from(resourcesInResource)
    .leftJoin(resourceAccessesInResource, getLastAccessedJoin(userId))
    .$dynamic();
  const resultResources = await (
    searchHits ? query.leftJoin(searchHits, eq(searchHits.id, resourcesInResource.id)) : query
  )
    .where(where)
    .orderBy(...orderBy)
    .limit(limit + 1)
    .offset(offset);
  return getBasePaginationData(resultResources, limit);
};
