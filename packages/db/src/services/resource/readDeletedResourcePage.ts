import type { Database, PageCursor, PageSort, ResourceListColumnKey } from "@esposter/db-schema";

import { readResourceListPage } from "#src/services/resource/readResourceListPage";
import { resourcesInResource } from "@esposter/db-schema";
import { and, eq, isNotNull } from "drizzle-orm";

// One page of the owner's Recycle bin: the resources soft-deleted and not yet purged, in the order the sort declares. Every
// Other resource list reads the live rows, so the bin is the one list whose where is the deleted rows
export const readDeletedResourcePage = (
  db: Database,
  {
    cursor,
    limit,
    sort,
    userId,
  }: { cursor: PageCursor; limit: number; sort: PageSort<ResourceListColumnKey>; userId: string },
) =>
  readResourceListPage(db, {
    cursor,
    limit,
    sort,
    userId,
    where: and(eq(resourcesInResource.userId, userId), isNotNull(resourcesInResource.deletedAt)),
  });
