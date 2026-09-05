import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { deleteDirectory, deleteTablePartitionEntities } from "@esposter/db";
import { AzureContainer, AzureTable, resources } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { inArray } from "drizzle-orm";

// The compensating cleanup every create rolls back through. A resource that never became durable must leave
// Nothing behind, and everything it can leave is reached by its own id: the blobs under its directory, and the
// Activity trail createResourceRow opens at insert time, which nothing else reclaims once the row gating reads of
// It is gone. Blobs and trail first, the row last as the durable marker, and both halves guarded — neither may
// Take the row delete or the original error down with it, which would tell the caller a cleanup step failed
// Instead of why the create did
export const deleteCreatedResources = async (ctx: AuthedContext, ids: Resource["id"][]): Promise<void> => {
  if (ids.length === 0) return;

  await getResultAsync(async () => {
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    await Promise.all(ids.map((id) => deleteDirectory(containerClient, id)));
  }).match(noop, console.error);
  await getResultAsync(async () => {
    const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
    await Promise.all(ids.map((id) => deleteTablePartitionEntities(resourceActivityClient, id)));
  }).match(noop, console.error);
  await ctx.db.delete(resources).where(inArray(resources.id, ids));
};
