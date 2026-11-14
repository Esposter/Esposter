import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { resourceVersionAssetsInResource, resourceVersionsInResource } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// The two statements that delete the versions a condition selects, in the order they must run: the reference rows are
// Read first, because they go with their versions by cascade. Returned rather than run, so the caller batches them with
// Whatever must commit with them — an unpublish with its publication row. An absent condition selects nothing, since
// It would otherwise match every version the table holds
export const getSnapshotVersionDeletes = (db: Context["db"], condition: SQL | undefined) => {
  const selection = condition ?? sql`0`;
  return [
    db
      .select({ assetHash: resourceVersionAssetsInResource.assetHash })
      .from(resourceVersionAssetsInResource)
      .innerJoin(
        resourceVersionsInResource,
        and(
          eq(resourceVersionAssetsInResource.resourceId, resourceVersionsInResource.resourceId),
          eq(resourceVersionAssetsInResource.channel, resourceVersionsInResource.channel),
          eq(resourceVersionAssetsInResource.version, resourceVersionsInResource.version),
        ),
      )
      .where(selection),
    db
      .delete(resourceVersionsInResource)
      .where(selection)
      .returning({ baseHash: resourceVersionsInResource.baseHash, hash: resourceVersionsInResource.hash }),
  ] as const;
};
