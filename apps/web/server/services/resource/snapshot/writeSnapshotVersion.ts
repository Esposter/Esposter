import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourceVersionInResource } from "@esposter/db-schema";
import type { WrittenVersion } from "keyframe-store";

import { collectSnapshotObjects } from "#server/services/resource/snapshot/collectSnapshotObjects";
import { getSnapshotVersionWrites } from "#server/services/resource/snapshot/getSnapshotVersionWrites";
import { prepareSnapshotVersion } from "#server/services/resource/snapshot/prepareSnapshotVersion";
import { releaseResourceAssets } from "#server/services/resource/snapshot/releaseResourceAssets";
import { resourceVersionAssetsInResource } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// The one way a version is taken, whichever channel it lands in: the content goes into the store against the channel's
// current anchor, and the row that makes it visible follows in one batch. The object is durable before the row exists, so
// a failure between the two leaves no version rather than a row naming nothing — the correct outcome for a version that was
// never stored (openspec/specs/resource/resource-version-store/design.md). What the write cost is handed back rather than
// charged here, because a publish claims its version inside its own batch and the charge locks the ledger row and then
// the user's, which must not run across that batch (openspec/specs/resource/storage-quotas/design.md)
//
// A write at a version that already has a row replaces it: the row moves to the new object, and the one it named is
// collected once the move has committed, as are the asset references it named that the new content no longer embeds
export const writeSnapshotVersion = async (
  db: Context["db"],
  resource: Pick<ResourceInResource, "id" | "type">,
  {
    channel,
    reason,
    version,
  }: Partial<Pick<ResourceVersionInResource, "reason">> & Pick<ResourceVersionInResource, "channel" | "version">,
  serializedContent: string,
): Promise<WrittenVersion> => {
  const { id } = resource;
  const prepared = await prepareSnapshotVersion(db, resource, channel, serializedContent);
  const { writtenVersion } = prepared;
  // Read before the batch replaces them, so the caller learns what the write displaced. Reads only: a release that
  // races this write is decided by the grace window, and a collection by the rows that survive the batch
  const [previousVersion, replacedAssetRows] = await Promise.all([
    db.query.resourceVersionsInResource.findFirst({
      columns: { baseHash: true, hash: true },
      where: { channel: { eq: channel }, resourceId: { eq: id }, version: { eq: version } },
    }),
    db
      .select({ assetHash: resourceVersionAssetsInResource.assetHash })
      .from(resourceVersionAssetsInResource)
      .where(
        and(
          eq(resourceVersionAssetsInResource.resourceId, id),
          eq(resourceVersionAssetsInResource.channel, channel),
          eq(resourceVersionAssetsInResource.version, version),
        ),
      ),
  ]);
  await db.batch(getSnapshotVersionWrites(db, id, { channel, reason, version }, prepared));
  // After the batch, never inside: collection publishes the deletion the moment it decides, and a commit that failed after that
  // would leave the row naming an object already gone. Best-effort like every other collection — a failed one leaves the object
  // stored and charged until purge, never the version unwritten
  if (previousVersion && previousVersion.hash !== writtenVersion.hash)
    await getResultAsync(() => collectSnapshotObjects(db, id, [previousVersion])).match(noop, console.error);
  const releasedAssetHashes = replacedAssetRows
    .map(({ assetHash }) => assetHash)
    .filter((assetHash) => !prepared.assetHashes.has(assetHash));
  await getResultAsync(() => releaseResourceAssets(db, id, releasedAssetHashes)).match(noop, console.error);
  return writtenVersion;
};
