import type { InvocationContext } from "@azure/functions";
import type { ContainerClient } from "@azure/storage-blob";
import type { ResourceInResource } from "@esposter/db-schema";

import { getTableClient } from "#src/services/azure/getTableClient";
import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { purgeResource } from "@esposter/db";
import { getResourceOwnedTableNames } from "@esposter/db-schema";

// One resource's purge, then the broadcast to the owners it gave bytes back to. The timer's per-resource body, which the
// One-time survey purge repeats for each survey
export const purgeResourceAndBroadcast = async (
  context: InvocationContext,
  containerClient: ContainerClient,
  { id, type }: Pick<ResourceInResource, "id" | "type">,
): Promise<void> => {
  // The type decides which partitions this resource owns, so the client list is per-resource
  const tableClients = await Promise.all(
    getResourceOwnedTableNames(type).map((tableName) => getTableClient(tableName)),
  );
  const releasedUserIds = await purgeResource(db, containerClient, tableClients, id);
  await broadcastStorageUsage(context, releasedUserIds);
};
