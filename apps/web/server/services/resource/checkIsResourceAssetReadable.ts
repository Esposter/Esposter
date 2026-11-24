import type { ResourceAccess } from "#server/models/resource/ResourceAccess";
import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";
import type { Database } from "@esposter/db-schema";

import { SnapshotChannel } from "@esposter/db-schema";

// Whether a caller may read one asset is the single definition of the question.
// The serving endpoint asks it before it signs a presigned url, and the duplicate clone before it copies a blob.
// The clone copies whatever url the caller's content names.
// A check living only on the read path would let anyone holding an unreadable url paste it into their own resource.
// The clone would then re-serve the owner's private blob.
// A url the caller may not read is data rather than an error.
// The clone carries it verbatim, so a shared blueprint keeps rendering for whoever can already see its assets.
// Ownership and publication come in as `access` (readResourceAccess).
// So this asks only the `per-asset` query.
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
