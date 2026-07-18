import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { AzureContainer, resources } from "@esposter/db-schema";
import { inArray } from "drizzle-orm";

// Compensating cleanup for a mid-deploy failure — removes the rows and content blobs already created so a
// Partial deploy leaves nothing behind. Best-effort: deleteIfExists tolerates a blob that never got written
export const deleteBlueprintDeployedResources = async (ctx: AuthedContext, ids: Resource["id"][]): Promise<void> => {
  if (ids.length === 0) return;

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  await Promise.all(ids.map((id) => containerClient.getBlockBlobClient(getContentBlobName(id)).deleteIfExists()));
  await ctx.db.delete(resources).where(inArray(resources.id, ids));
};
