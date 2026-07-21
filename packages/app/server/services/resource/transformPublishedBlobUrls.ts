import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useUpdateBlobUrls } from "@@/server/composables/resource/useUpdateBlobUrls";
import { getContentBlobUrls } from "@@/server/services/resource/getContentBlobUrls";
import { getPublishedDirectoryName } from "@@/server/services/resource/getPublishedDirectoryName";
import { cloneBlobUrls } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";

// Published snapshots must survive the owner deleting/replacing working-copy assets, so the referenced
// Asset blobs are cloned under the publish directory and the content is rewritten to serve the clones
export const transformPublishedBlobUrls = async <TContent>(
  ctx: AuthedContext,
  resource: Resource,
  content: TContent,
): Promise<TContent> => {
  const blobUrls = getContentBlobUrls(content);
  if (blobUrls.length === 0) return content;
  // The hook runs before the factory bumps the publication row, so the clone directory is keyed
  // By the version this publish is about to claim (default 1 on the first publish)
  const publication = await ctx.db.query.resourcePublications.findFirst({
    where: { resourceId: { eq: resource.id } },
  });
  const publishedDirectoryName = getPublishedDirectoryName(resource.id, (publication?.publishVersion ?? 0) + 1);
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  await cloneBlobUrls(containerClient, blobUrls, resource.id, publishedDirectoryName);
  return useUpdateBlobUrls(content, publishedDirectoryName, blobUrls);
};
