import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { SaveResourceContentInput } from "#server/models/resource/SaveResourceContentInput";
import type { ResourceInResource, ResourceLinkInResource } from "@esposter/db-schema";

import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { readDeviceId } from "#server/services/realtime/readDeviceId";
import { getResourceLinkKey } from "#server/services/resource/link/getResourceLinkKey";
import { ResourceTypeGetLinkTargetsMap } from "#server/services/resource/link/ResourceTypeGetLinkTargetsMap";
import { pruneWorkingAssets } from "#server/services/resource/pruneWorkingAssets";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { reserveWorkingAssets } from "#server/services/resource/reserveWorkingAssets";
import { ResourceAfterSaveContentMap } from "#server/services/resource/ResourceAfterSaveContentMap";
import { runAfterSaveResourceContent } from "#server/services/resource/runAfterSaveResourceContent";
import { getSnapshotAssetHashes } from "#server/services/resource/snapshot/getSnapshotAssetHashes";
import { releaseResourceAssets } from "#server/services/resource/snapshot/releaseResourceAssets";
import { takeResourceRevision } from "#server/services/resource/snapshot/takeResourceRevision";
import { writeResourceActivity } from "#server/services/resource/writeResourceActivity";
import { chargeAndEmitStorageLedgerEntry } from "#server/services/storage/chargeAndEmitStorageLedgerEntry";
import { getBucket } from "#server/services/storage/getBucket";
import { SNAPSHOT_INTERVAL_MS, STALE_CONTENT_VERSION_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getContentBlobName, writeJsonBlob } from "@esposter/db";
import {
  StorageBucket,
  ResourceActivityType,
  resourceLinksInResource,
  resourcesInResource,
  SnapshotReason,
} from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, exists, sql } from "drizzle-orm";
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
  // Throws to keep one deliberate destructive act undoable (openspec/specs/resource/resource-snapshots/design.md).
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
  const bucket = getBucket(StorageBucket.ResourceAssets);
  const contentBlobName = getContentBlobName(id);
  const writeContentBlob = async () => {
    isContentBlobWriteAttempted = true;
    const storedContentBlob = await writeJsonBlob(bucket, contentBlobName, serializedContent);
    // Unconditional, so the bucket answers the object it stored, and a null here is a fault rather than a result
    if (!storedContentBlob)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The write answered no object" });
    storedContentSize = storedContentBlob.size;
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
  // A save's links are a set its content version names. The clear and the write are guarded on that version, so a save
  // superseded since it established its version clears nothing and writes nothing
  const isCurrentContentVersion = (expectedContentVersion: number) =>
    exists(
      ctx.db
        .select({ id: resourcesInResource.id })
        .from(resourcesInResource)
        .where(and(eq(resourcesInResource.id, id), eq(resourcesInResource.contentVersion, expectedContentVersion))),
    );
  // No links is the set that can never be wrong — it authorizes nothing — so a clear is safe to apply anywhere
  const clearResourceLinks = (where?: ReturnType<typeof isCurrentContentVersion>) =>
    ctx.db.delete(resourceLinksInResource).where(and(eq(resourceLinksInResource.sourceId, id), where));
  // The clear and the write are one batch, the write guarded on the version as the clear is, so the set is either the one this
  // save wrote or the one the save that superseded it wrote
  const writeResourceLinks = (expectedContentVersion: number) => {
    // Epoch milliseconds, since an insert from a select takes no JS default for the timestamp columns
    const now = Date.now();
    return ctx.db.batch([
      clearResourceLinks(isCurrentContentVersion(expectedContentVersion)),
      ctx.db.insert(resourceLinksInResource).select(
        ctx.db
          .select({
            createdAt: sql<Date>`${now}`.as("createdAt"),
            sourceId: sql<ResourceInResource["id"]>`${id}`.as("sourceId"),
            targetId: sql<string>`json_extract(link.value, '$.targetId')`.as("targetId"),
            type: sql<ResourceLinkInResource["type"]>`json_extract(link.value, '$.type')`.as("type"),
            updatedAt: sql<Date>`${now}`.as("updatedAt"),
          })
          .from(sql`json_each(${JSON.stringify(resourceLinkTargets)}) AS link`)
          .where(isCurrentContentVersion(expectedContentVersion)),
      ),
    ]);
  };
  // The links are cleared before the upload and written after the charge, so they never claim what the blob does not back. A
  // cleared set rejects the survey's tokens until the next save that lands writes it again — every partial outcome lands there
  // rather than on a stale set:
  //
  // - the version check loses to a concurrent save: nothing was claimed, so no link is cleared
  // - the upload fails: the version bump is put back and the links are cleared, since for an unbind the content may have landed
  //   and keeping the old set would be fail-open
  // - it succeeds: the new links are written after, once the content they describe is durable
  //
  // The assets the content embeds, named by the working copy's reference rows before the upload and settled to them
  // After it. Scanned from the serialized content, the bytes the blob is written from
  const assetHashes = getSnapshotAssetHashes(serializedContent);
  await reserveWorkingAssets(ctx.db, id, assetHashes);
  // The bump is claimed before the upload, so a save that loses the version check writes no content. A failed upload puts it
  // back, so a write that did not land never leaves a version every client caches against advanced. A first write has no
  // version to protect and claims none
  let savedResource: ResourceInResource;
  // The rows dropped once the blob has landed, released after the write so a dropped asset is collected like any other
  let removedAssetHashes: string[] = [];
  if (contentVersion === undefined) {
    if (hasResourceLinksChanged) await clearResourceLinks();
    await writeContentBlob();
    await ctx.db.update(resourcesInResource).set({ contentHash, contentSize }).where(eq(resourcesInResource.id, id));
    removedAssetHashes = await pruneWorkingAssets(ctx.db, id, assetHashes);
    savedResource = { ...resource, contentHash, contentSize };
  } else {
    // One statement for every column the save moves, with the version check part of it so concurrent saves cannot both
    // pass and silently lose one write
    const [updatedResource] = await ctx.db
      .update(resourcesInResource)
      .set({ contentHash, contentSize, contentVersion: contentVersion + 1 })
      .where(and(eq(resourcesInResource.id, id), eq(resourcesInResource.contentVersion, contentVersion)))
      .returning();
    if (!updatedResource) throw new TRPCError({ code: "BAD_REQUEST", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });
    savedResource = updatedResource;
    if (hasResourceLinksChanged) await clearResourceLinks(isCurrentContentVersion(savedResource.contentVersion));
    await getResultAsync(async () => {
      isContentBlobWriteAttempted = true;
      await writeContentBlob();
      removedAssetHashes = await pruneWorkingAssets(ctx.db, id, assetHashes);
    }).match(noop, async (error) => {
      // Put back only while it is still this save's bump, and the failure clears links whichever way the upload went
      await getResultAsync(() =>
        ctx.db
          .update(resourcesInResource)
          .set({ contentHash: resource.contentHash, contentSize: resource.contentSize, contentVersion })
          .where(
            and(eq(resourcesInResource.id, id), eq(resourcesInResource.contentVersion, savedResource.contentVersion)),
          ),
      ).match(noop, console.error);
      if (hasResourceLinksChanged && isContentBlobWriteAttempted) await clearResourceLinks();
      throw error;
    });
  }
  // The owner is charged for their own content as for any upload, from here because this write knows its size
  // And a blob with no reserve behind it has no ledger row for `BlobCreated` to find. `resource.userId`, not the
  // Caller: a blueprint deploy or a restore writes on the owner's behalf. After the transaction, because the
  // Charge takes the ledger row's lock and then the user's, and a save's transaction held open across those is a
  // Connection waiting on locks it will not release (openspec/specs/resource/storage-quotas/design.md)
  await chargeAndEmitStorageLedgerEntry(
    ctx.db,
    resource.userId,
    StorageBucket.ResourceAssets,
    contentBlobName,
    storedContentSize,
  );
  // Guarded on the version this save established: the bump is what orders two saves, and this write lands after the bump, so
  // unguarded a save that committed first could overwrite a later one's links. A failed write clears the set rather than
  // keeping the previous one, which the committed content no longer backs
  if (hasResourceLinksChanged)
    await getResultAsync(() => writeResourceLinks(savedResource.contentVersion)).match(noop, async (error) => {
      await clearResourceLinks();
      throw error;
    });

  // Best-effort like every release: a failed one leaves a dropped asset stored and charged until a release names it again
  await getResultAsync(() => releaseResourceAssets(ctx.db, id, removedAssetHashes)).match(noop, console.error);
  // The key an agent wrote with, named so an open editor can say who saved; "" for the person's own save. The owner's
  // tabs hear it, all but the tab that saved it, which names itself in the device header
  const deviceId = readDeviceId(ctx.headers);
  await callUserObjects([savedResource.userId], (userObject) =>
    userObject.saveResourceContent(
      { apiKeyName: ctx.apiKey?.name ?? "", contentVersion: savedResource.contentVersion, id },
      deviceId,
    ),
  );
  // Not awaited — a failure costs one activity row, and the coalescing scan it does would otherwise land on
  // Every write the user is waiting on
  if (activityType) getSynchronizedFunction(writeResourceActivity)(ctx, { activityType, resourceId: id });
  runAfterSaveResourceContent(ctx, savedResource, parsedContent, previousContent);
  return savedResource;
};
