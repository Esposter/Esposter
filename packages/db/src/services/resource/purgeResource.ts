import type { R2Bucket } from "@cloudflare/workers-types";

import type { Database, ResourceInResource, UserInAuth } from "@esposter/db-schema";

import { deleteDirectory } from "#src/services/storage/deleteDirectory";
import { releaseStorageLedgerEntriesByPrefix } from "#src/services/storage/releaseStorageLedgerEntriesByPrefix";
import { StorageBucket, resourcesInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Ordered for idempotent retry: blob directory, then the storage ledger, then the row LAST. A partial failure leaves the
// row behind as the durable marker that re-drives the whole sequence; the blob delete treats already-gone as success, so
// replaying is safe. The row's delete cascades to everything the resource owns in the database (its activity trail, its
// view counters and whatever its type owns), so none of it can outlive the marker
// Returns the owner the release gave bytes back to, since a purge running on the timer sweep is out of the
// Process their meter subscribes to — empty when the resource had no accounted blobs left to free
export const purgeResource = async (
  db: Database,
  bucket: R2Bucket,
  resourceId: ResourceInResource["id"],
): Promise<UserInAuth["id"][]> => {
  await deleteDirectory(bucket, resourceId);
  // The directory takes every asset at once, so its owner's storage counter has to give the whole directory
  // Back at once too — the deletion never enumerates names. The ledger's only foreign key is `userId`, so the
  // Row deleted below cascades nothing here: without this call the rows survive the purge forever, holding
  // Their `countedBytes` against an owner who no longer has the resource. Resources are the only thing purged,
  // So the container is theirs by construction. See openspec/specs/resource/storage-quotas/design.md
  //
  // Last but one, immediately before the row: released bytes are reported back exactly once, and a step that
  // Fails after the release replays a purge that now frees nothing and so tells the caller nobody to notify —
  // The counter has moved and every open meter still shows the old figure. Releasing after the row instead
  // Would spend the marker that re-drives the sequence, and a release that then failed would hold the bytes
  // Against the owner for good
  const releasedUserIds = await releaseStorageLedgerEntriesByPrefix(db, StorageBucket.ResourceAssets, `${resourceId}/`);
  await db.delete(resourcesInResource).where(eq(resourcesInResource.id, resourceId));
  return releasedUserIds;
};
