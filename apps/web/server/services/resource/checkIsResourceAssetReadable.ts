import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";
import type { Database } from "@esposter/db-schema";

import { SnapshotChannel } from "@esposter/db-schema";

// Whether a caller may read one asset — the single definition of the question, asked by the serving endpoint before
// It signs a SAS and by the duplicate clone before it copies a blob. The clone copies whatever url the caller's content
// Names, so a check living only on the read path would let anyone holding a url they cannot open paste it into their
// Own resource and have the clone re-serve the owner's private blob. A url the caller may not read is data rather than
// An error: the clone carries it verbatim, so a shared blueprint keeps rendering for whoever can already see its assets
export const checkIsResourceAssetReadable = async (
  db: Database,
  { hash, resourceId }: Pick<ResourceAssetPath, "hash" | "resourceId">,
  userId?: string,
): Promise<boolean> => {
  if (userId) {
    const resource = await db.query.resourcesInResource.findFirst({
      where: { deletedAt: { isNull: true }, id: { eq: resourceId }, userId: { eq: userId } },
    });
    if (resource) return true;
  }

  // Read per request and never cached: unpublish revokes anonymous access by deleting the publication row, and the
  // Asset is public only while the current publication's version names its hash
  const publication = await db.query.resourcePublicationsInResource.findFirst({
    where: { resourceId: { eq: resourceId } },
  });
  if (!publication) return false;

  const publishedAsset = await db.query.resourceVersionAssetsInResource.findFirst({
    where: {
      assetHash: { eq: hash },
      channel: { eq: SnapshotChannel.Published },
      resourceId: { eq: resourceId },
      version: { eq: publication.publishVersion },
    },
  });
  return Boolean(publishedAsset);
};
