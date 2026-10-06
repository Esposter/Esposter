import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Transaction } from "#server/models/db/Transaction";
import type { SaveResourceContentInput } from "#server/models/resource/SaveResourceContentInput";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getDevice } from "#server/services/auth/getDevice";
import { resourceEventEmitter } from "#server/services/resource/events/resourceEventEmitter";
import { getResourceLinkKey } from "#server/services/resource/link/getResourceLinkKey";
import { ResourceTypeGetLinkTargetsMap } from "#server/services/resource/link/ResourceTypeGetLinkTargetsMap";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { ResourceAfterSaveContentMap } from "#server/services/resource/ResourceAfterSaveContentMap";
import { runAfterSaveResourceContent } from "#server/services/resource/runAfterSaveResourceContent";
import { takeResourceRevision } from "#server/services/resource/snapshot/takeResourceRevision";
import { writeResourceActivity } from "#server/services/resource/writeResourceActivity";
import { chargeAndEmitStorageLedgerEntry } from "#server/services/storage/chargeAndEmitStorageLedgerEntry";
import { SNAPSHOT_INTERVAL_MS, STALE_CONTENT_VERSION_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getContentBlobName, writeJsonBlob } from "@esposter/db";
import {
  AzureContainer,
  ResourceActivityType,
  resourceLinksInResource,
  resourcesInResource,
  SnapshotReason,
} from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { createHash } from "node:crypto";

// The durable write and everything that must follow it, as one unit: the save event, the activity entry and the
// Type's after-save hook. Every door — editor save, blueprint deploy, duplicate, restore — writes through here,
// So a resource's reminders, schedules and derived state cannot depend on which door its content came through
export const saveResourceContent = async (
  ctx: AuthedContext,
  { activityType, content, contentVersion, resource }: SaveResourceContentInput,
): Promise<ResourceInResource> => {
  const { id } = resource;
  // One recovery point per interval, so an hour of editing leaves a handful of them. Measured from the last
  // Revision rather than from the last save: `updatedAt` moves on every autosave, so a save clock says "still
  // Busy" for as long as the owner keeps typing and a continuous session would leave no points at all — which
  // Is the opposite of when recovery is wanted. Ordinary saves only — a restore and a blueprint deploy take
  // Their own, and a first write has no prior state. Before the write, since what is worth keeping is what this
  // Save replaces, and awaited so a revision cannot snapshot the content it was meant to precede. Best-effort
  // Only here: a failed safety net must not fail the autosave it was protecting, where every other trigger
  // Throws to keep one deliberate destructive act undoable (/docs/resource/resource-snapshots).
  //
  // This check is a filter, not the throttle. `resource` was read before the save, so two concurrent saves both
  // Hold the same pre-take timestamp and both pass — what it buys is skipping the content download on the saves
  // That obviously have no revision to take. `takeResourceRevision` claims the interval in the row itself
  if (
    activityType === ResourceActivityType.ContentSaved &&
    (!resource.revisionTakenAt || Date.now() - resource.revisionTakenAt.getTime() >= SNAPSHOT_INTERVAL_MS)
  )
    await getResultAsync(() => takeResourceRevision(ctx, resource, SnapshotReason.Automatic)).match(
      noop,
      console.error,
    );
  // Parsed here rather than at each door, because this is the door: `content` arrives as `unknown` and everything
  // Downstream reads it as the type's own shape, so an unparsed caller reaches the hook with strings where it
  // Declares Dates — a blueprint manifest carries content as `z.unknown()`, so a deployed TodoList's `dueAt` is
  // The ISO string its reminder scheduler calls `.getTime()` on. A caller that already parsed pays an idempotent
  // Second pass
  const parsedContent: unknown = ResourceDefinitionMap[resource.type].contentSchema.parse(content);
  // Read before the write overwrites it, so an after-save hook can diff against it (undefined on the first
  // Write). Only paid where a hook is registered, and best-effort like the hook itself: an unreadable prior blob
  // Degrades to "no previous content" rather than blocking a valid write
  const previousContent: unknown = ResourceAfterSaveContentMap[resource.type]
    ? await getResultAsync(() =>
        readResourceContent(ResourceDefinitionMap[resource.type].contentSchema, id),
      ).match<unknown>(
        (priorContent) => priorContent,
        () => undefined,
      )
    : undefined;
  // Whether the upload was attempted, which is what decides how a failed save unwinds — not whether it resolved,
  // Since an upload that rejects may still have landed the blob. The mistakes are unequal: clearing links whose
  // Upload never landed costs their reads until the next save, leaving ones whose upload did land fails open
  let isContentBlobWriteAttempted = false;
  // What the owner is charged: the length the compressed blob takes at rest, not the JSON's
  let storedContentSize = 0;
  const serializedContent = JSON.stringify(parsedContent);
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const contentBlobName = getContentBlobName(id);
  const writeContentBlob = async () => {
    isContentBlobWriteAttempted = true;
    storedContentSize = await writeJsonBlob(containerClient, contentBlobName, serializedContent);
  };
  // What the blob holds once decoded: the hash so the client can tell whether the bytes it sent are the bytes
  // Stored — a delta save is computed against exactly these — and the size a read picks its transport by, both of
  // The JSON rather than of the frame it is stored as. Written with the blob, so neither ever describes bytes that
  // Were not stored
  const contentHash = createHash("sha256").update(serializedContent).digest("hex");
  const contentSize = Buffer.byteLength(serializedContent);
  // The content's links, projected here rather than in an after-save hook, which is best-effort by contract, and
  // Kept in step with the blob: `resolveIdentifiedToken` reads them to decide whether a participant token was
  // Issued for the survey being answered, so a link that lags its blob authorizes against content that is gone,
  // And one still naming an unbound survey answers yes to a revoked token
  const getResourceLinkTargets = ResourceTypeGetLinkTargetsMap.get(resource.type);
  const resourceLinkTargets = getResourceLinkTargets?.(parsedContent) ?? [];
  // Only when the set moved: most saves leave a resource's links alone, and a type declaring none never reads
  // Them, so neither pays for a write
  const resourceLinkKeys = new Set(
    resourceLinkTargets.map((resourceLinkTarget) => getResourceLinkKey(resourceLinkTarget)),
  );
  const storedResourceLinkTargets = getResourceLinkTargets
    ? await ctx.db.query.resourceLinksInResource.findMany({
        columns: { targetId: true, type: true },
        where: { sourceId: { eq: id } },
      })
    : [];
  const hasResourceLinksChanged =
    storedResourceLinkTargets.length !== resourceLinkKeys.size ||
    storedResourceLinkTargets.some(
      (storedResourceLinkTarget) => !resourceLinkKeys.has(getResourceLinkKey(storedResourceLinkTarget)),
    );
  // No links is the set that can never be wrong — it authorizes nothing — so a clear is safe to apply anywhere
  const clearResourceLinks = (db: Context["db"] | Transaction) =>
    db.delete(resourceLinksInResource).where(eq(resourceLinksInResource.sourceId, id));
  // Under a lock on the row at the version this save established, so the write loses to a newer save the way the
  // Version bump itself does, and a save committing meanwhile waits for these rows rather than interleaving
  const writeResourceLinks = (expectedContentVersion: number) =>
    ctx.db.transaction(async (tx) => {
      const [lockedResource] = await tx
        .select({ id: resourcesInResource.id })
        .from(resourcesInResource)
        .where(and(eq(resourcesInResource.id, id), eq(resourcesInResource.contentVersion, expectedContentVersion)))
        .for("update");
      if (!lockedResource) return;

      await clearResourceLinks(tx);
      if (resourceLinkTargets.length > 0)
        await tx
          .insert(resourceLinksInResource)
          .values(resourceLinkTargets.map(({ targetId, type }) => ({ sourceId: id, targetId, type })));
    });
  // The links are cleared inside the transaction and written after it commits, so they never claim what the blob
  // Does not back. A cleared set rejects the survey's tokens until the next save that lands writes it again —
  // Every partial outcome lands there rather than on a stale set:
  //
  // - the version check loses to a concurrent save: the clear rolls back with it, so the winner's links stand
  // - the transaction fails after the upload: the rollback restores links for content that is already gone,
  //   Which for an unbind is fail-open, so the clear is reapplied outside the transaction
  // - it commits: the new links are written after, once the content they describe is durable
  //
  // The bump and the blob share one transaction so a failed write rolls the bump back — a write that did not land
  // Must never advance the version every client caches against. A first write has no version to protect, and
  // Wrapping it would hold a pooled connection across a storage round trip
  let savedResource: ResourceInResource;
  if (contentVersion === undefined) {
    if (hasResourceLinksChanged) await clearResourceLinks(ctx.db);
    await writeContentBlob();
    await ctx.db.update(resourcesInResource).set({ contentHash, contentSize }).where(eq(resourcesInResource.id, id));
    savedResource = { ...resource, contentHash, contentSize };
  } else
    savedResource = await getResultAsync(() =>
      ctx.db.transaction(async (tx) => {
        // One statement for every column the save moves, with the version check part of it so concurrent saves
        // Cannot both pass and silently lose one write. Ahead of the upload is safe: nothing it sets is visible
        // Before the commit, and a failed upload rolls it back
        const updatedResource = (
          await tx
            .update(resourcesInResource)
            .set({ contentHash, contentSize, contentVersion: contentVersion + 1 })
            .where(and(eq(resourcesInResource.id, id), eq(resourcesInResource.contentVersion, contentVersion)))
            .returning()
        )[0];
        if (!updatedResource)
          throw new TRPCError({ code: "BAD_REQUEST", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });
        if (hasResourceLinksChanged) await clearResourceLinks(tx);
        await writeContentBlob();
        return updatedResource;
      }),
    ).match(
      (updatedResource) => updatedResource,
      async (error) => {
        if (hasResourceLinksChanged && isContentBlobWriteAttempted) await clearResourceLinks(ctx.db);
        throw error;
      },
    );
  // The owner is charged for their own content as for any upload, from here because this write knows its size
  // And a blob with no reserve behind it has no ledger row for `BlobCreated` to find. `resource.userId`, not the
  // Caller: a blueprint deploy or a restore writes on the owner's behalf. After the transaction, because the
  // Charge takes the ledger row's lock and then the user's, and a save's transaction held open across those is a
  // Connection waiting on locks it will not release (/docs/resource/storage-quotas)
  await chargeAndEmitStorageLedgerEntry(
    ctx.db,
    resource.userId,
    AzureContainer.ResourceAssets,
    contentBlobName,
    storedContentSize,
  );
  // Guarded on the version this save established: the bump is what orders two saves, and this write lands after
  // The transaction that made it, so unguarded a save that committed first could overwrite a later one's links
  if (hasResourceLinksChanged) await writeResourceLinks(savedResource.contentVersion);

  resourceEventEmitter.emit("saveResourceContent", [
    { content: parsedContent, contentVersion: savedResource.contentVersion, id },
    getDevice(ctx.getSessionPayload),
  ]);
  // Not awaited — a failure costs one activity row, and the coalescing scan it does would otherwise land on
  // Every write the user is waiting on
  if (activityType)
    getSynchronizedFunction(writeResourceActivity)({
      activityType,
      resourceId: id,
      userId: ctx.getSessionPayload.user.id,
    });
  runAfterSaveResourceContent(ctx, savedResource, parsedContent, previousContent);
  return savedResource;
};
