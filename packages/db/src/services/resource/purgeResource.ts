import type { ContainerClient } from "@azure/storage-blob";
import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient, Database, Resource } from "@esposter/db-schema";

import { deleteDirectory } from "@/services/azure/container/deleteDirectory";
import { deleteTablePartitionEntities } from "@/services/resource/deleteTablePartitionEntities";
import { releaseStorageBlobsByPrefix } from "@/services/storage/releaseStorageBlobsByPrefix";
import { AzureContainer, resources } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Ordered for idempotent retry: blob directory, then dependent Azure Table partitions, then the
// Postgres row LAST. A partial failure leaves the row behind as the durable marker that re-drives
// The whole sequence; blob and table deletes treat already-gone as success, so replaying is safe.
// The caller passes every table client whose partition this resource owns — its activity trail, its
// View counters, and whatever its type owns (see ResourceOwnedTablesMap) — because a partition left
// Behind here is unreachable the moment the row goes
export const purgeResource = async (
  db: Database,
  containerClient: ContainerClient,
  tableClients: CustomTableClient<CompositeKey>[],
  resourceId: Resource["id"],
) => {
  await deleteDirectory(containerClient, resourceId);
  // The directory takes every asset at once, so its owner's storage counter has to give the whole directory
  // Back at once too — the deletion never enumerates names. The ledger's only foreign key is `userId`, so the
  // Row deleted below cascades nothing here: without this call the rows survive the purge forever, holding
  // Their `countedBytes` against an owner who no longer has the resource. Resources are the only thing purged,
  // So the container is theirs by construction. See /docs/platform/storage-quotas
  await releaseStorageBlobsByPrefix(db, AzureContainer.ResourceAssets, `${resourceId}/`);
  // The partitions are independent, so only the blob-before-tables and tables-before-row ordering matters
  await Promise.all(tableClients.map((tableClient) => deleteTablePartitionEntities(tableClient, resourceId)));
  await db.delete(resources).where(eq(resources.id, resourceId));
};
