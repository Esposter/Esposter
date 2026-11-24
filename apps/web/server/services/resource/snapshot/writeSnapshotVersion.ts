import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourceVersionInResource } from "@esposter/db-schema";
import type { WrittenVersion } from "keyframe-store";

import { getSnapshotVersionWrites } from "#server/services/resource/snapshot/getSnapshotVersionWrites";
import { prepareSnapshotVersion } from "#server/services/resource/snapshot/prepareSnapshotVersion";
import { withResourceObjectLock } from "#server/services/resource/snapshot/withResourceObjectLock";

// The one way a version is taken, whichever channel it lands in: the content goes into the store against the channel's
// Current anchor, and the row that makes it visible follows in one batch. The object is durable before the row exists,
// So A failure between the two leaves no version rather than a row naming nothing — the correct outcome for a version
// That was never stored (openspec/specs/resource/resource-version-store/design.md). What the write cost is handed back
// Rather than charged here, because a publish claims its version inside its own batch and the charge locks the ledger
// Row and then the user's, which must not run across that batch (openspec/specs/resource/storage-quotas/design.md).
// A revision's number is never written twice: the counter that claims it only rises, and a number a failed write burned
// Is never claimed again (takeResourceRevision), so the row insert has no earlier row of its own to replace
export const writeSnapshotVersion = (
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
  // The object is put and its row inserted under the lease, so a collection cannot free the object between the two
  return withResourceObjectLock(db, id, async () => {
    const prepared = await prepareSnapshotVersion(db, resource, channel, serializedContent);
    await db.batch(getSnapshotVersionWrites(db, id, { channel, reason, version }, prepared));
    return prepared.writtenVersion;
  });
};
