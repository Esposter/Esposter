import type { InvocationContext } from "@azure/functions";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { getTableClient } from "#src/services/azure/getTableClient";
import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { purgeResource } from "@esposter/db";
import {
  AzureContainer,
  AzureFunction,
  getResourceOwnedTableNames,
  RECYCLE_BIN_RETENTION_MS,
  resourcesInResource,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, isNotNull, lt } from "drizzle-orm";

// The timer's purge: every row the recycle bin has held past its retention. The row is the durable marker, so anything
// That fails mid-purge simply keeps its row and is re-driven by the next run of this function.
export const purgeExpiredResources = async (context: InvocationContext): Promise<void> => {
  const expiredResources = await db
    .select()
    .from(resourcesInResource)
    .where(
      and(
        isNotNull(resourcesInResource.deletedAt),
        lt(resourcesInResource.deletedAt, new Date(Date.now() - RECYCLE_BIN_RETENTION_MS)),
      ),
    );
  if (expiredResources.length === 0) return;

  context.log(`${AzureFunction.PurgeDeletedResources} purging`, { count: expiredResources.length });
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  // Per-resource so one poisoned resource cannot block the rest of the sweep; its row survives,
  // So the next tick retries it. Failures are logged, never rethrown — a rethrow would strand
  // The resources this pass already purged behind a retry of the whole batch.
  for (const { id, type } of expiredResources)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one resource at a time, each fanning out across its own partitions and blob directory
    await getResultAsync(async () => {
      // The type decides which partitions this resource owns, so the client list is per-resource
      const tableClients = await Promise.all(
        getResourceOwnedTableNames(type).map((tableName) => getTableClient(tableName)),
      );
      const releasedUserIds = await purgeResource(db, containerClient, tableClients, id);
      await broadcastStorageUsage(context, releasedUserIds);
    }).match(noop, (error) => {
      context.error(`${AzureFunction.PurgeDeletedResources} failed to purge resource ${id}: `, error);
    });
};
