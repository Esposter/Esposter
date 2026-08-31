import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { createSnapshotAssetsDirectoryName } from "@@/server/services/resource/createSnapshotAssetsDirectoryName";

// Published snapshots must survive the owner deleting/replacing working-copy assets, so the referenced
// Asset blobs are cloned under the publish directory and the content is rewritten to serve the clones
export const transformPublishedBlobUrls = <TContent>(
  ctx: AuthedContext,
  resource: Resource,
  content: TContent,
): Promise<TContent> =>
  cloneContentAssets(
    ctx.db,
    ctx.getSessionPayload.user.id,
    content,
    createSnapshotAssetsDirectoryName(resource.id, SnapshotChannel.Published),
  );
