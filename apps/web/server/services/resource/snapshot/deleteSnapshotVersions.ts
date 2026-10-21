import type { Transaction } from "#server/models/db/Transaction";
import type { ResourceInResource } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { lockSnapshotObjects } from "#server/services/resource/snapshot/lockSnapshotObjects";
import { resourceVersionAssetsInResource, resourceVersionsInResource } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// Deletes the versions a condition selects and hands back what they held: the rows collection takes and the asset
// Hashes their reference rows named. It runs in the caller's transaction, so any other rows the caller removes commit
// Or roll back with them. The reference rows go with their versions by cascade, so they are read first, and the read
// And the delete share the resource's object lock, so a version written in between cannot be deleted with references
// Nobody read
export const deleteSnapshotVersions = async (
  tx: Transaction,
  resourceId: ResourceInResource["id"],
  condition: SQL | undefined,
) => {
  // An absent condition would match every version the table holds, so it selects none
  if (!condition) return { assetHashes: [], deletedVersions: [] };

  await lockSnapshotObjects(tx, resourceId);
  const referenceRows = await tx
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
    .where(condition);
  const deletedVersions = await tx
    .delete(resourceVersionsInResource)
    .where(condition)
    .returning({ baseHash: resourceVersionsInResource.baseHash, hash: resourceVersionsInResource.hash });
  return { assetHashes: [...new Set(referenceRows.map(({ assetHash }) => assetHash))], deletedVersions };
};
