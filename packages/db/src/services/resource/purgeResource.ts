import type { ContainerClient } from "@azure/storage-blob";
import type { CompositeKey, CustomTableClient, relations, Resource } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

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
  db: PostgresJsDatabase<typeof relations>,
  containerClient: ContainerClient,
  tableClients: CustomTableClient<CompositeKey>[],
  resourceId: Resource["id"],
) => {
  await deleteDirectory(containerClient, resourceId);
  // The directory takes every asset at once, so its owner's storage counter has to give the whole directory
  // Back at once too — the deletion never enumerates names, and the resource row's cascade would drop the
  // Ledger rows below without ever decrementing what they were holding. Resources are the only thing purged,
  // So the container is theirs by construction. See /docs/platform/storage-quotas
  await releaseStorageBlobsByPrefix(db, AzureContainer.ResourceAssets, `${resourceId}/`);
  // The partitions are independent, so only the blob-before-tables and tables-before-row ordering matters
  await Promise.all(tableClients.map((tableClient) => deleteTablePartitionEntities(tableClient, resourceId)));
  await db.delete(resources).where(eq(resources.id, resourceId));
};
