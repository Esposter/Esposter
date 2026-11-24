import type { PreparedSnapshotVersion } from "#server/services/resource/snapshot/prepareSnapshotVersion";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourceVersionInResource, SnapshotChannel } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { UndefinedOnPartial } from "type-fest";

import { epochMsSql } from "#server/services/db/epochMsSql";
import { resourceVersionAssetsInResource, resourceVersionsInResource } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// The rows that make a prepared version visible, returned rather than run so the caller can batch them with what must
// Commit with them: the version row, then its asset references. `version` is a number, or a subquery reading a counter
// The same batch has just bumped. The version row is a plain insert, so a row holding its number fails the batch
// Rather than being replaced. Every writer claims its number fresh, but a publish landing after its resource's
// Delete reuses the number of the publication it tombstoned, and the insert refuses that number. The asset rows
// Are one statement over a JSON array, since a bind limit of 100 parameters per statement would cap a document at
// A few dozen assets
export const getSnapshotVersionWrites = (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  {
    channel,
    reason,
    version,
  }: { channel: SnapshotChannel; version: number | SQL<number> } & UndefinedOnPartial<
    Partial<Pick<ResourceVersionInResource, "reason">>
  >,
  { assetHashes, summary, writtenVersion }: PreparedSnapshotVersion,
) => {
  const { baseHash, hash, plaintextBytes, storedBytes } = writtenVersion;
  const now = Date.now();
  return [
    db
      .insert(resourceVersionsInResource)
      .values({ baseHash, channel, hash, plaintextBytes, reason, resourceId, storedBytes, summary, version }),
    ...(assetHashes.size > 0
      ? [
          db
            .insert(resourceVersionAssetsInResource)
            .select(
              db
                .select({
                  assetHash: sql<string>`asset.value`.as("assetHash"),
                  channel: sql<SnapshotChannel>`${channel}`.as("channel"),
                  createdAt: epochMsSql(now).as("createdAt"),
                  resourceId: sql<ResourceInResource["id"]>`${resourceId}`.as("resourceId"),
                  updatedAt: epochMsSql(now).as("updatedAt"),
                  version: sql<number>`${version}`.as("version"),
                })
                .from(sql`json_each(${JSON.stringify([...assetHashes])}) AS asset`),
            ),
        ]
      : []),
  ] as const;
};
