import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { AzureContainer, resources } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { inArray } from "drizzle-orm";

// The compensating cleanup both blueprint writes roll back through — a mid-deploy failure that already
// Created entries, and a capture whose manifest upload failed after its row existed. Removes the content
// Blobs and then the rows, so neither a row without its content nor a blob no row can reach is left behind.
// Best-effort: deleteIfExists tolerates a blob that never got written.
// Ordered like duplicateResource's rollback — blobs first, the row last as the durable marker — and the blob
// Half is guarded because it must never take the row delete or the original error down with it: the caller
// Would be told a blob delete failed instead of why the write did, and be left with exactly the half-created
// Resources this cleanup exists to remove
export const deleteBlueprintResources = async (ctx: AuthedContext, ids: Resource["id"][]): Promise<void> => {
  if (ids.length === 0) return;

  await getResultAsync(async () => {
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    await Promise.all(ids.map((id) => containerClient.getBlockBlobClient(getContentBlobName(id)).deleteIfExists()));
  }).match(noop, console.error);
  await ctx.db.delete(resources).where(inArray(resources.id, ids));
};
