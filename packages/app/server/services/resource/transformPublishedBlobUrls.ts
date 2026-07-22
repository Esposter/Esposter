import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { getPublishedDirectoryName } from "@@/server/services/resource/getPublishedDirectoryName";

// Published snapshots must survive the owner deleting/replacing working-copy assets, so the referenced
// Asset blobs are cloned under the publish directory and the content is rewritten to serve the clones
export const transformPublishedBlobUrls = async <TContent>(
  ctx: AuthedContext,
  resource: Resource,
  content: TContent,
): Promise<TContent> => {
  // The hook runs before the factory bumps the publication row, so the clone directory is keyed
  // By the version this publish is about to claim (default 1 on the first publish)
  const publication = await ctx.db.query.resourcePublications.findFirst({
    where: { resourceId: { eq: resource.id } },
  });
  return cloneContentAssets(content, getPublishedDirectoryName(resource.id, (publication?.publishVersion ?? 0) + 1));
};
