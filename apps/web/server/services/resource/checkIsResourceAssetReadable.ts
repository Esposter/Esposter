import type { ResourceAccess } from "#server/models/resource/ResourceAccess";
import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";
import type { Database } from "@esposter/db-schema";

import { SnapshotChannel } from "@esposter/db-schema";

// Whether a caller may read one asset — the single definition of the question, asked by the serving endpoint before
// It signs a SAS and by the duplicate clone before it copies a blob. The clone copies whatever url the caller's content
// Names, so a check living only on the read path would let anyone holding a url they cannot open paste it into their
// Own resource and have the clone re-serve the owner's private blob. A url the caller may not read is data rather than
// An error: the clone carries it verbatim, so a shared blueprint keeps rendering for whoever can already see its assets
// The resource's ownership and publication come in as `access` (readResourceAccess), so this asks only the per-asset query
export const checkIsResourceAssetReadable = async (
  db: Database,
  { hash, resourceId }: Pick<ResourceAssetPath, "hash" | "resourceId">,
  access: ResourceAccess,
): Promise<boolean> => {
  if (access.isOwned) return true;
  if (access.publishVersion === undefined) return false;

  const publishedAsset = await db.query.resourceVersionAssetsInResource.findFirst({
    where: {
      assetHash: { eq: hash },
      channel: { eq: SnapshotChannel.Published },
      resourceId: { eq: resourceId },
      version: { eq: access.publishVersion },
    },
  });
  return Boolean(publishedAsset);
};
