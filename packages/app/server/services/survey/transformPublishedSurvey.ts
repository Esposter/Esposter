import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { PublishableResourceProcedureOptions } from "@@/server/models/resource/PublishableResourceProcedureOptions";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useUpdateBlobUrls } from "@@/server/composables/survey/useUpdateBlobUrls";
import { getPublishedDirectoryName } from "@@/server/services/resource/getPublishedDirectoryName";
import { extractBlobUrls } from "@@/server/services/survey/extractBlobUrls";
import { AzureContainer } from "@esposter/db-schema";
import { cloneBlobUrls } from "@esposter/db";

// Published snapshots must survive the owner deleting/replacing working-copy assets, so the referenced
// Asset blobs are cloned under the publish directory and the model is rewritten to serve the clones
export const transformPublishedSurvey: NonNullable<
  PublishableResourceProcedureOptions<SurveyResource>["transformPublishedContent"]
> = async (ctx, resource, content) => {
  const blobUrls = extractBlobUrls(content.model);
  if (blobUrls.length === 0) return content;

  // The hook runs before the factory bumps the publication row, so the clone directory is keyed
  // By the version this publish is about to claim (default 1 on the first publish)
  const publication = await ctx.db.query.resourcePublications.findFirst({
    where: { resourceId: { eq: resource.id } },
  });
  const publishedDirectoryName = getPublishedDirectoryName(resource.id, (publication?.publishVersion ?? 0) + 1);
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  await cloneBlobUrls(containerClient, blobUrls, resource.id, publishedDirectoryName);
  return { ...content, model: await useUpdateBlobUrls(content.model, publishedDirectoryName) };
};
