import type { TimerHandler } from "@azure/functions";

import { db } from "#src/services/db";
import { getContainerClient } from "#src/services/getContainerClient";
import { getTableClient } from "#src/services/getTableClient";
import { logAndRethrow } from "#src/services/logAndRethrow";
import { purgeResource } from "@esposter/db";
import {
  AzureContainer,
  AzureFunction,
  getResourceOwnedTableNames,
  RECYCLE_BIN_RETENTION_MS,
  resources,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, isNotNull, lt } from "drizzle-orm";

// Everything the Recycle bin held past its window is destroyed here — the row is the durable
// Marker, so anything that fails mid-purge simply keeps its row and is re-driven next tick.
export const purgeDeletedResourcesHandler: TimerHandler = (_timer, context) =>
  getResultAsync(async () => {
    const expiredResources = await db
      .select()
      .from(resources)
      .where(
        and(isNotNull(resources.deletedAt), lt(resources.deletedAt, new Date(Date.now() - RECYCLE_BIN_RETENTION_MS))),
      );
    if (expiredResources.length === 0) return;

    context.log(`${AzureFunction.PurgeDeletedResources} purging`, { count: expiredResources.length });
    const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
    // Per-resource so one poisoned resource cannot block the rest of the sweep; its row survives,
    // So the next tick retries it. Failures are logged, never rethrown — a rethrow would strand
    // The resources this pass already purged behind a retry of the whole batch.
    for (const { id, type } of expiredResources)
      await getResultAsync(async () => {
        // The type decides which partitions this resource owns, so the client list is per-resource
        const tableClients = await Promise.all(
          getResourceOwnedTableNames(type).map((tableName) => getTableClient(tableName)),
        );
        await purgeResource(db, containerClient, tableClients, id);
      }).match(noop, (error) => {
        context.error(`${AzureFunction.PurgeDeletedResources} failed to purge resource ${id}: `, error);
      });
  }).match(noop, logAndRethrow(context, AzureFunction.PurgeDeletedResources));
