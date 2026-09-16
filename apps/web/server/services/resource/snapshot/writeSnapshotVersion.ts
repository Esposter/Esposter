import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Resource, ResourceVersion } from "@esposter/db-schema";
import type { WrittenVersion } from "keyframe-store";

import { collectSnapshotObjects } from "@@/server/services/resource/snapshot/collectSnapshotObjects";
import { createSnapshotKeyframeStore } from "@@/server/services/resource/snapshot/createSnapshotKeyframeStore";
import { getSnapshotSummary } from "@@/server/services/resource/snapshot/getSnapshotSummary";
import { lockSnapshotObjects } from "@@/server/services/resource/snapshot/lockSnapshotObjects";
import { readSnapshotAnchor } from "@@/server/services/resource/snapshot/readSnapshotAnchor";
import { resourceVersions } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The one way a version is taken, whichever channel it lands in: the content goes into the store against the
// Channel's current anchor, and the row that makes it visible follows. The object is durable before the row
// Exists, so a failure between the two leaves no version rather than a row naming nothing — the correct
// Outcome for a version that was never stored. The two happen under the resource's object lock, so no
// Collection can free the object, or the anchor it decodes against, in the gap between them
// (`lockSnapshotObjects`). What the write cost is handed back rather than charged here, because a publish
// Takes its version inside a transaction and the charge locks the ledger row and then the user's, which a
// Transaction must not be held open across (/docs/resource/storage-quotas)
export const writeSnapshotVersion = async (
  db: Context["db"] | Transaction,
  resource: Pick<Resource, "id" | "type">,
  { channel, reason, version }: Partial<Pick<ResourceVersion, "reason">> & Pick<ResourceVersion, "channel" | "version">,
  serializedContent: string,
): Promise<WrittenVersion> => {
  const { id } = resource;
  const keyframeStore = await createSnapshotKeyframeStore(id);
  const summary = getSnapshotSummary(resource.type, serializedContent);
  const { previousVersion, writtenVersion } = await db.transaction(async (tx) => {
    await lockSnapshotObjects(tx, id);
    const anchor = await readSnapshotAnchor(tx, id, channel);
    const storeWrite = await keyframeStore.write(Buffer.from(serializedContent), anchor).match(
      (value) => value,
      (error) => {
        throw error;
      },
    );
    const { baseHash, hash, plaintextBytes, storedBytes } = storeWrite;
    // The one rewrite of a version: a publish repairing its own snapshot at the version it already claimed.
    // The row moves to the new object, and the one it named is collected below once the move has committed
    const replacedVersion = await tx.query.resourceVersions.findFirst({
      columns: { baseHash: true, hash: true },
      where: { channel: { eq: channel }, resourceId: { eq: id }, version: { eq: version } },
    });
    await tx
      .insert(resourceVersions)
      .values({ baseHash, channel, hash, plaintextBytes, reason, resourceId: id, storedBytes, summary, version })
      .onConflictDoUpdate({
        set: { baseHash, hash, plaintextBytes, storedBytes, summary },
        target: [resourceVersions.resourceId, resourceVersions.channel, resourceVersions.version],
      });
    return { previousVersion: replacedVersion, writtenVersion: storeWrite };
  });
  // After the transaction, never inside: collection publishes the deletion the moment it decides, and a commit
  // That failed after that would leave the row naming an object already gone. Best-effort like every other
  // Collection — a failed one leaves the object stored and charged until purge, never the version unwritten
  if (previousVersion && previousVersion.hash !== writtenVersion.hash)
    await getResultAsync(() => collectSnapshotObjects(db, id, [previousVersion])).match(noop, console.error);
  return writtenVersion;
};
