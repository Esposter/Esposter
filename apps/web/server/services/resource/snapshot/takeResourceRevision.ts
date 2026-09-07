import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { getSnapshotContentBlobName } from "@@/server/services/resource/snapshot/getSnapshotContentBlobName";
import { getSnapshotMetadata } from "@@/server/services/resource/snapshot/getSnapshotMetadata";
import { getSnapshotSummary } from "@@/server/services/resource/snapshot/getSnapshotSummary";
import { chargeAndEmitStorageLedgerEntry } from "@@/server/services/storage/chargeAndEmitStorageLedgerEntry";
import { checkIsNotFound, getContentBlobName } from "@esposter/db";
import { AzureContainer, resources } from "@esposter/db-schema";
import { getResultAsync, streamToText } from "@esposter/shared";
import { eq, sql } from "drizzle-orm";

// A point the owner can return to, taken from the working copy as it stands. Returns the version it wrote, or
// Undefined when there was nothing to take — a resource whose content blob does not exist yet has no state worth
// A revision, and the paths that take one before overwriting a draft must not fail on an empty draft. It throws,
// So only a caller that can proceed without a revision swallows it (/docs/platform/resource-snapshots)
//
// The bytes are copied rather than parsed and re-serialized: a revision is what the working copy was, so a field
// A later version of the type stopped declaring must not be filtered out of the snapshot taken to recover it
export const takeResourceRevision = async (
  ctx: AuthedContext,
  resource: Resource,
  reason: SnapshotReason,
  label = "",
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
  // Upload burns a number rather than reusing one — which is the harmless direction: the listing is what
  // Answers which revisions exist, and it simply never sees the number that was skipped
  const [updatedResource] = await ctx.db
    .update(resources)
    .set({ revisionVersion: sql`${resources.revisionVersion} + 1` })
    .where(eq(resources.id, id))
    .returning({ revisionVersion: resources.revisionVersion });
  if (!updatedResource) return undefined;

  const { revisionVersion } = updatedResource;
  const blobName = getSnapshotContentBlobName(id, SnapshotChannel.Revisions, revisionVersion);
  await useUpload(
    AzureContainer.ResourceAssets,
    blobName,
    serializedContent,
    getSnapshotMetadata({ label, reason, summary: getSnapshotSummary(resource.type, serializedContent) }),
  );
  // A revision is stored bytes the owner keeps, charged like the working copy it was taken from. On the
  // Owner rather than the caller: a deploy or a restore writes on their behalf. See /docs/platform/storage-quotas
  await chargeAndEmitStorageLedgerEntry(
    ctx.db,
    resource.userId,
    AzureContainer.ResourceAssets,
    blobName,
    Buffer.byteLength(serializedContent),
  );
  // Evicting by number rather than by listing keeps this to one publish rather than a walk of the prefix on
  // Every save, and a number the buffer already passed over names a blob that is not there — which the deletion
  // Path treats as success (/docs/platform/resource-snapshots)
  const { maxRetained } = SnapshotChannelDefinitionMap[SnapshotChannel.Revisions];
  const evictedVersion = revisionVersion - maxRetained;
  if (evictedVersion > 0)
    await publishBlobDeletion(id, AzureContainer.ResourceAssets, [
      getSnapshotContentBlobName(id, SnapshotChannel.Revisions, evictedVersion),
    ]);
  return revisionVersion;
};
