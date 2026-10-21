import type { Transaction } from "#server/models/db/Transaction";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourceVersionInResource } from "@esposter/db-schema";
import type { WrittenVersion } from "keyframe-store";

import { collectSnapshotObjects } from "#server/services/resource/snapshot/collectSnapshotObjects";
import { createSnapshotKeyframeStore } from "#server/services/resource/snapshot/createSnapshotKeyframeStore";
import { getSnapshotAssetHashes } from "#server/services/resource/snapshot/getSnapshotAssetHashes";
import { getSnapshotSummary } from "#server/services/resource/snapshot/getSnapshotSummary";
import { lockSnapshotObjects } from "#server/services/resource/snapshot/lockSnapshotObjects";
import { readSnapshotAnchor } from "#server/services/resource/snapshot/readSnapshotAnchor";
import { releaseResourceAssets } from "#server/services/resource/snapshot/releaseResourceAssets";
import { requireSnapshotAssetsExist } from "#server/services/resource/snapshot/requireSnapshotAssetsExist";
import { resourceVersionAssetsInResource, resourceVersionsInResource } from "@esposter/db-schema";
import { getResultAsync, jsonDateParse, noop } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// The one way a version is taken, whichever channel it lands in: the content goes into the store against the
// Channel's current anchor, and the row that makes it visible follows. The object is durable before the row
// Exists, so a failure between the two leaves no version rather than a row naming nothing — the correct
// Outcome for a version that was never stored. The two happen under the resource's object lock, so no
// Collection can free the object, or the anchor it decodes against, in the gap between them
// (`lockSnapshotObjects`). What the write cost is handed back rather than charged here, because a publish
// Takes its version inside a transaction and the charge locks the ledger row and then the user's, which a
// Transaction must not be held open across (openspec/specs/resource/storage-quotas/design.md)
//
// The version's asset references are written with its row, from a scan of the same content. A version naming an asset
// That is no longer stored is refused before anything is written (openspec/specs/resource/content-addressed-assets/design.md)
export const writeSnapshotVersion = async (
  db: Context["db"] | Transaction,
  resource: Pick<ResourceInResource, "id" | "type">,
  {
    channel,
    reason,
    version,
  }: Partial<Pick<ResourceVersionInResource, "reason">> & Pick<ResourceVersionInResource, "channel" | "version">,
  serializedContent: string,
): Promise<WrittenVersion> => {
  const { id } = resource;
  const keyframeStore = await createSnapshotKeyframeStore(id);
  const summary = getSnapshotSummary(resource.type, serializedContent);
  const assetHashes = getSnapshotAssetHashes(id, jsonDateParse(serializedContent));
  const { previousVersion, releasedAssetHashes, writtenVersion } = await db.transaction(async (tx) => {
    await lockSnapshotObjects(tx, id);
    // Checked before the object is written, so a refused version leaves no object behind either
    await requireSnapshotAssetsExist(id, assetHashes);
    const anchor = await readSnapshotAnchor(tx, id, channel);
    const storeWrite = await keyframeStore.write(Buffer.from(serializedContent), anchor).match(
      (value) => value,
      (error) => {
        throw error;
      },
    );
    const { baseHash, hash, plaintextBytes, storedBytes } = storeWrite;
    // A write at a version that already has a row replaces it: the row moves to the new object, and the one it named is
    // collected below once the move has committed
    const replacedVersion = await tx.query.resourceVersionsInResource.findFirst({
      columns: { baseHash: true, hash: true },
      where: { channel: { eq: channel }, resourceId: { eq: id }, version: { eq: version } },
    });
    await tx
      .insert(resourceVersionsInResource)
      .values({ baseHash, channel, hash, plaintextBytes, reason, resourceId: id, storedBytes, summary, version })
      .onConflictDoUpdate({
        set: { baseHash, hash, plaintextBytes, storedBytes, summary },
        target: [
          resourceVersionsInResource.resourceId,
          resourceVersionsInResource.channel,
          resourceVersionsInResource.version,
        ],
      });
    // The references are replaced whole, so the rows name exactly what this content embeds. The ones they replace
    // Are released below, less any the new content still names
    const replacedAssetRows = await tx
      .delete(resourceVersionAssetsInResource)
      .where(
        and(
          eq(resourceVersionAssetsInResource.resourceId, id),
          eq(resourceVersionAssetsInResource.channel, channel),
          eq(resourceVersionAssetsInResource.version, version),
        ),
      )
      .returning({ assetHash: resourceVersionAssetsInResource.assetHash });
    if (assetHashes.size > 0)
      await tx
        .insert(resourceVersionAssetsInResource)
        .values(Array.from(assetHashes, (assetHash) => ({ assetHash, channel, resourceId: id, version })));
    return {
      previousVersion: replacedVersion,
      releasedAssetHashes: replacedAssetRows
        .map(({ assetHash }) => assetHash)
        .filter((assetHash) => !assetHashes.has(assetHash)),
      writtenVersion: storeWrite,
    };
  });
  // After the transaction, never inside: collection publishes the deletion the moment it decides, and a commit
  // That failed after that would leave the row naming an object already gone. Best-effort like every other
  // Collection — a failed one leaves the object stored and charged until purge, never the version unwritten
  if (previousVersion && previousVersion.hash !== writtenVersion.hash)
    await getResultAsync(() => collectSnapshotObjects(db, id, [previousVersion])).match(noop, console.error);
  await getResultAsync(() => releaseResourceAssets(db, id, releasedAssetHashes)).match(noop, console.error);
  return writtenVersion;
};
