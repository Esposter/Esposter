import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { createPublishedAssetsDirectoryName } from "@@/server/services/resource/createPublishedAssetsDirectoryName";

// Published snapshots must survive the owner deleting/replacing working-copy assets, so the referenced
// Asset blobs are cloned under the publish directory and the content is rewritten to serve the clones
export const transformPublishedBlobUrls = <TContent>(
  _ctx: AuthedContext,
  resource: Resource,
  content: TContent,
): Promise<TContent> => cloneContentAssets(content, createPublishedAssetsDirectoryName(resource.id));
