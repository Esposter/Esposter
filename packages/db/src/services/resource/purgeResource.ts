import type { ContainerClient } from "@azure/storage-blob";
import type { CompositeKey, CustomTableClient, relations, Resource } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { deleteDirectory } from "@/services/azure/container/deleteDirectory";
import { deleteTablePartitionEntities } from "@/services/resource/deleteTablePartitionEntities";
import { resources } from "@esposter/db-schema";
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
  await deleteDirectory(containerClient, resourceId, true);
  for (const tableClient of tableClients) await deleteTablePartitionEntities(tableClient, resourceId);
  await db.delete(resources).where(eq(resources.id, resourceId));
};
