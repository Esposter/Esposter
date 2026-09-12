import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { SNAPSHOT_INTERVAL_MS } from "#shared/services/resource/constants";
import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { chargeSnapshotVersion } from "@@/server/services/resource/snapshot/chargeSnapshotVersion";
import { collectSnapshotObjects } from "@@/server/services/resource/snapshot/collectSnapshotObjects";
import { writeSnapshotVersion } from "@@/server/services/resource/snapshot/writeSnapshotVersion";
import { checkIsNotFound, getContentBlobName } from "@esposter/db";
import { AzureContainer, resources, resourceVersions, SnapshotChannel, SnapshotReason } from "@esposter/db-schema";
import { getResultAsync, noop, streamToText } from "@esposter/shared";
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
  resource: Resource,
  reason: SnapshotReason,
): Promise<number | undefined> => {
  const { id } = resource;
  // A missing content blob is "nothing to snapshot", never an error: a resource created and never saved
  // Reaches the before-restore and before-import triggers exactly like any other
  const contentStream = await getResultAsync(() =>
    useDownload(AzureContainer.ResourceAssets, getContentBlobName(id)),
  ).match(
    ({ readableStreamBody }) => readableStreamBody,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  if (!contentStream) return undefined;

  const serializedContent = await streamToText(contentStream);
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
    .update(resources)
    .set({ revisionTakenAt: new Date(), revisionVersion: sql`${resources.revisionVersion} + 1` })
    .where(
      reason === SnapshotReason.Automatic
        ? and(
            eq(resources.id, id),
            or(
              isNull(resources.revisionTakenAt),
              lte(resources.revisionTakenAt, new Date(Date.now() - SNAPSHOT_INTERVAL_MS)),
            ),
          )
        : eq(resources.id, id),
    )
    .returning({ revisionVersion: resources.revisionVersion });
  if (!updatedResource) return undefined;

  const { revisionVersion } = updatedResource;
  const writtenVersion = await writeSnapshotVersion(
    ctx.db,
    resource,
    { channel: SnapshotChannel.Revisions, reason, version: revisionVersion },
    serializedContent,
  );
  await chargeSnapshotVersion(ctx.db, resource, writtenVersion);
  // The ring buffer sheds the rows that fell out of the window, and collection publishes exactly the objects
  // Nothing else references — so eviction never names a blob that is not there, and a burned number is not a
  // Concept that exists (/docs/resource/resource-snapshots)
  const { maxRetained } = SnapshotChannelDefinitionMap[SnapshotChannel.Revisions];
  const evictedVersions = await ctx.db
    .delete(resourceVersions)
    .where(
      and(
        eq(resourceVersions.resourceId, id),
        eq(resourceVersions.channel, SnapshotChannel.Revisions),
        lte(resourceVersions.version, revisionVersion - maxRetained),
      ),
    )
    .returning({ baseHash: resourceVersions.baseHash, hash: resourceVersions.hash });
  if (evictedVersions.length > 0)
    await getResultAsync(() => collectSnapshotObjects(ctx.db, id, evictedVersions)).match(noop, console.error);
  return revisionVersion;
};
