import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { ResourceInResource } from "@esposter/db-schema";

import { SNAPSHOT_INTERVAL_MS } from "#shared/services/resource/constants";
import { getSnapshotRetainedSince } from "#shared/services/resource/getSnapshotRetainedSince";
import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import { readSerializedResourceContent } from "@@/server/services/resource/readSerializedResourceContent";
import { chargeSnapshotVersion } from "@@/server/services/resource/snapshot/chargeSnapshotVersion";
import { collectSnapshotObjects } from "@@/server/services/resource/snapshot/collectSnapshotObjects";
import { writeSnapshotVersion } from "@@/server/services/resource/snapshot/writeSnapshotVersion";
import { resourcesInResource, resourceVersionsInResource, SnapshotChannel, SnapshotReason } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, isNull, lte, or, sql } from "drizzle-orm";

// A point the owner can return to, taken from the working copy as it stands. Returns the version it wrote, or
// Undefined when there was nothing to take — a resource whose content blob does not exist yet has no state worth
// A revision, and the paths that take one before overwriting a draft must not fail on an empty draft. It throws,
// So only a caller that can proceed without a revision swallows it (/docs/resource/resource-snapshots)
//
// The bytes are copied rather than parsed and re-serialized: a revision is what the working copy was, so a field
// A later version of the type stopped declaring must not be filtered out of the snapshot taken to recover it
export const takeResourceRevision = async (
  ctx: AuthedContext,
  resource: ResourceInResource,
  reason: SnapshotReason,
): Promise<number | undefined> => {
  const { id } = resource;
  // A missing content blob is "nothing to snapshot", never an error: a resource created and never saved
  // Reaches the before-restore and before-import triggers exactly like any other
  const serializedContent = await readSerializedResourceContent(id);
  if (!serializedContent) return undefined;
  // Claimed in SQL so concurrent takes each get a distinct number. The counter leads the write, so a failed
  // Write burns a number rather than reusing one — which is the harmless direction: the rows are what answer
  // Which revisions exist, and a burned number simply has none. The timestamp moves with it for the same
  // Reason: it throttles the automatic take, and a failed write that left the clock untouched would have the
  // Next save retry immediately.
  //
  // The interval is part of the claim rather than only the caller's precondition. A save reads its row before it
  // Writes, so two concurrent saves both hold a `revisionTakenAt` from before either took a revision and both
  // Pass that check — the throttle only holds if the row itself refuses the second one. Losing the race is not a
  // Failure: the interval already has its recovery point. A deliberate take (before a restore, before an import)
  // Claims unconditionally, because there the revision is the thing that makes the act undoable
  const [updatedResource] = await ctx.db
    .update(resourcesInResource)
    .set({ revisionTakenAt: new Date(), revisionVersion: sql`${resourcesInResource.revisionVersion} + 1` })
    .where(
      reason === SnapshotReason.Automatic
        ? and(
            eq(resourcesInResource.id, id),
            or(
              isNull(resourcesInResource.revisionTakenAt),
              lte(resourcesInResource.revisionTakenAt, new Date(Date.now() - SNAPSHOT_INTERVAL_MS)),
            ),
          )
        : eq(resourcesInResource.id, id),
    )
    .returning({ revisionVersion: resourcesInResource.revisionVersion });
  if (!updatedResource) return undefined;

  const { revisionVersion } = updatedResource;
  const writtenVersion = await writeSnapshotVersion(
    ctx.db,
    resource,
    { channel: SnapshotChannel.Revisions, reason, version: revisionVersion },
    serializedContent,
  );
  await chargeSnapshotVersion(ctx.db, resource, writtenVersion);
  // Sheds the rows past the channel's age, which every read already treats as gone, and the oldest past its count.
  // Collection publishes exactly the objects nothing else references — so eviction never names a blob that is not
  // There, and a burned number is not a concept that exists (/docs/resource/resource-snapshots)
  const { maxRetained } = SnapshotChannelDefinitionMap[SnapshotChannel.Revisions];
  const evictedVersions = await ctx.db
    .delete(resourceVersionsInResource)
    .where(
      and(
        eq(resourceVersionsInResource.resourceId, id),
        eq(resourceVersionsInResource.channel, SnapshotChannel.Revisions),
        or(
          lte(resourceVersionsInResource.version, revisionVersion - maxRetained),
          lte(resourceVersionsInResource.createdAt, getSnapshotRetainedSince(SnapshotChannel.Revisions)),
        ),
      ),
    )
    .returning({ baseHash: resourceVersionsInResource.baseHash, hash: resourceVersionsInResource.hash });
  if (evictedVersions.length > 0)
    await getResultAsync(() => collectSnapshotObjects(ctx.db, id, evictedVersions)).match(noop, console.error);
  return revisionVersion;
};
