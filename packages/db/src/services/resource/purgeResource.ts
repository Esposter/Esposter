import type { ContainerClient } from "@azure/storage-blob";
import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient, Database, Resource, User } from "@esposter/db-schema";

import { deleteDirectory } from "#src/services/azure/container/deleteDirectory";
import { deleteTablePartitionEntities } from "#src/services/resource/deleteTablePartitionEntities";
import { releaseStorageLedgerEntriesByPrefix } from "#src/services/storage/releaseStorageLedgerEntriesByPrefix";
import { AzureContainer, resources } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Ordered for idempotent retry: blob directory, then dependent Azure Table partitions, then the
// Postgres row LAST. A partial failure leaves the row behind as the durable marker that re-drives
// The whole sequence; blob and table deletes treat already-gone as success, so replaying is safe.
// The caller passes every table client whose partition this resource owns — its activity trail, its
// View counters, and whatever its type owns (see ResourceOwnedTablesMap) — because a partition left
// Behind here is unreachable the moment the row goes.
// Returns the owner the release gave bytes back to, since a purge running on the timer sweep is out of the
// Process their meter subscribes to — empty when the resource had no accounted blobs left to free
export const purgeResource = async (
  db: Database,
  containerClient: ContainerClient,
  tableClients: CustomTableClient<CompositeKey>[],
  resourceId: Resource["id"],
): Promise<User["id"][]> => {
  await deleteDirectory(containerClient, resourceId);
  // The partitions are independent, so only the blob-before-tables and tables-before-row ordering matters
  await Promise.all(tableClients.map((tableClient) => deleteTablePartitionEntities(tableClient, resourceId)));
  // The directory takes every asset at once, so its owner's storage counter has to give the whole directory
  // Back at once too — the deletion never enumerates names. The ledger's only foreign key is `userId`, so the
  // Row deleted below cascades nothing here: without this call the rows survive the purge forever, holding
  // Their `countedBytes` against an owner who no longer has the resource. Resources are the only thing purged,
  // So the container is theirs by construction. See /docs/platform/storage-quotas
  //
  // Last but one, immediately before the row: released bytes are reported back exactly once, and a step that
  // Fails after the release replays a purge that now frees nothing and so tells the caller nobody to notify —
  // The counter has moved and every open meter still shows the old figure. Releasing after the row instead
  // Would spend the marker that re-drives the sequence, and a release that then failed would hold the bytes
  // Against the owner for good
  const releasedUserIds = await releaseStorageLedgerEntriesByPrefix(
    db,
    AzureContainer.ResourceAssets,
    `${resourceId}/`,
  );
  await db.delete(resources).where(eq(resources.id, resourceId));
  return releasedUserIds;
};
