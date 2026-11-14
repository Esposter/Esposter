import type { PreparedSnapshotVersion } from "#server/services/resource/snapshot/prepareSnapshotVersion";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourceVersionInResource, SnapshotChannel } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { resourceVersionAssetsInResource, resourceVersionsInResource } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// The rows that make a prepared version visible, returned rather than run so the caller can batch them with what must
// commit with them: the version row, then its asset references replaced whole. `version` is a number, or a subquery
// reading a counter the same batch has just bumped. The asset rows are one statement over a JSON array, since a bind
// limit of 100 parameters per statement would cap a document at a few dozen assets
export const getSnapshotVersionWrites = (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  {
    channel,
    reason,
    version,
  }: Partial<Pick<ResourceVersionInResource, "reason">> & { channel: SnapshotChannel; version: number | SQL<number> },
  { assetHashes, summary, writtenVersion }: PreparedSnapshotVersion,
) => {
  const { baseHash, hash, plaintextBytes, storedBytes } = writtenVersion;
  // Epoch milliseconds, the encoding the timestamp columns store, since an insert from a select takes no JS default
  const now = Date.now();
  return [
    db
      .insert(resourceVersionsInResource)
      .values({ baseHash, channel, hash, plaintextBytes, reason, resourceId, storedBytes, summary, version })
      .onConflictDoUpdate({
        set: { baseHash, hash, plaintextBytes, storedBytes, summary },
        target: [
          resourceVersionsInResource.resourceId,
          resourceVersionsInResource.channel,
          resourceVersionsInResource.version,
        ],
      }),
    // A write at a version that already has a row replaces it, so the references it named are dropped before the new ones
    db
      .delete(resourceVersionAssetsInResource)
      .where(
        and(
          eq(resourceVersionAssetsInResource.resourceId, resourceId),
          eq(resourceVersionAssetsInResource.channel, channel),
          eq(resourceVersionAssetsInResource.version, version),
        ),
      ),
    ...(assetHashes.size > 0
      ? [
          db
            .insert(resourceVersionAssetsInResource)
            .select(
              db
                .select({
                  assetHash: sql<string>`asset.value`.as("assetHash"),
                  channel: sql<SnapshotChannel>`${channel}`.as("channel"),
                  createdAt: sql<Date>`${now}`.as("createdAt"),
                  resourceId: sql<ResourceInResource["id"]>`${resourceId}`.as("resourceId"),
                  updatedAt: sql<Date>`${now}`.as("updatedAt"),
                  version: sql<number>`${version}`.as("version"),
                })
                .from(sql`json_each(${JSON.stringify([...assetHashes])}) AS asset`),
            ),
        ]
      : []),
  ] as const;
};
