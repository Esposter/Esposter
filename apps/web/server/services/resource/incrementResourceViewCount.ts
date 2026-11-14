import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { getUtcDateString } from "#shared/util/date/getUtcDateString";
import { resourceViewsInResource } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { sql } from "drizzle-orm";

// One row per resource per UTC day, incremented in one statement, so every view counts exactly once. The read path
// Must never fail or slow because of counting, so a failed increment is logged and that view is dropped
export const incrementResourceViewCount = async (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
): Promise<void> => {
  await getResultAsync(async () =>
    db
      .insert(resourceViewsInResource)
      .values({ count: 1, resourceId, utcDate: getUtcDateString(new Date()) })
      .onConflictDoUpdate({
        set: { count: sql`${resourceViewsInResource.count} + 1` },
        target: [resourceViewsInResource.resourceId, resourceViewsInResource.utcDate],
      }),
  ).match(noop, console.error);
};
