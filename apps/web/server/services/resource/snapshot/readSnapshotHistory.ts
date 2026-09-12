import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";
import type { Context } from "@@/server/trpc/context";
import type { Resource, SnapshotChannel } from "@esposter/db-schema";

// A channel's history is its version rows, which is what makes the listing one query rather than a walk of a
// Blob prefix. Which one is current is passed in rather than derived, because only the publication row answers
// Which published version is live — no row means nothing is current
export const readSnapshotHistory = async (
  db: Context["db"],
  id: Resource["id"],
  channel: SnapshotChannel,
  currentVersion?: number,
): Promise<SnapshotVersion[]> => {
  const resourceVersions = await db.query.resourceVersions.findMany({
    columns: { createdAt: true, reason: true, summary: true, version: true },
    orderBy: { version: "asc" },
    where: { channel: { eq: channel }, resourceId: { eq: id } },
  });
  return resourceVersions.map(({ createdAt, reason, summary, version }) => ({
    channel,
    isCurrent: version === currentVersion,
    reason: reason ?? undefined,
    summary,
    takenAt: createdAt,
    version,
  }));
};
