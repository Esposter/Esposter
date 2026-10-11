import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { getLastAccessedJoin } from "#server/services/resource/getLastAccessedJoin";
import { resourceListSelection } from "#server/services/resource/resourceListSelection";
import { resourceAccessesInResource, resourcesInResource } from "@esposter/db-schema";

// One offset page of the resource list, each row carrying the caller's own last access, in the order the caller gives.
// It reads one row past the limit, which is how the page knows there is more
export const readResourceListPage = async (
  db: Context["db"],
  userId: string,
  where: SQL | undefined,
  orderBy: SQL[],
  limit: number,
  offset: number,
) => {
  const resultResources = await db
    .select(resourceListSelection)
    .from(resourcesInResource)
    .leftJoin(resourceAccessesInResource, getLastAccessedJoin(userId))
    .where(where)
    .orderBy(...orderBy)
    .limit(limit + 1)
    .offset(offset);
  return getBasePaginationData(resultResources, limit);
};
