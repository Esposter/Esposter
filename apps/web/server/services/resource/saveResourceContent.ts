import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { SaveResourceContentInput } from "#server/models/resource/SaveResourceContentInput";
import type { ResourceInResource, ResourceLinkInResource } from "@esposter/db-schema";

import { epochMsSql } from "#server/services/db/epochMsSql";
import { ownedBy } from "#server/services/db/ownedBy";
import { getOwnedLiveResourceWhere } from "#server/services/resource/getOwnedLiveResourceWhere";
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
  ResourceActivityType,
  resourceLinksInResource,
  resourcesInResource,
  SnapshotReason,
  StorageBucket,
} from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { getContentAddress } from "@esposter/shared-node/cache";
import { TRPCError } from "@trpc/server";
import { and, eq, exists, sql } from "drizzle-orm";

// The durable write and everything that must follow it, as one unit.
// That is the activity entry and the type's after-save hook.
// Every door (editor save, blueprint deploy, duplicate, restore) writes through here.
// So a resource's reminders, schedules and derived state cannot depend on which door its content came through.
export const saveResourceContent = async (
  ctx: AuthedContext,
  { activityType, content, contentVersion, resource }: SaveResourceContentInput,
): Promise<ResourceInResource> => {
  const { id } = resource;
  // One recovery point per interval, so an hour of editing leaves a handful of them.
  // It is measured from the last revision rather than from the last save.
  // `updatedAt` moves on every autosave, so a save clock says "still busy" for as long as the owner keeps typing.
  // A continuous session would then leave no points at all, which is the opposite of when recovery is wanted.
  // Ordinary saves only: a restore and a blueprint deploy take their own, and a first write has no prior state.
  // It is taken before the write, since what is worth keeping is what this save replaces.
  // It is awaited, so a revision cannot snapshot the content it was meant to precede.
  // It is best-effort only here: a failed safety net must not fail the autosave it was protecting.
  // Every other trigger throws, to keep one deliberate destructive act undoable.
  // See openspec/specs/resource/resource-snapshots/design.md.
  //
  // This check is a filter, not the throttle.
  // `resource` was read before the save, so two concurrent saves both hold the same pre-take timestamp and both pass.
  // What it buys is skipping the content download on the saves that obviously have no revision to take.
  // `takeResourceRevision` claims the interval in the row itself.
  if (
    activityType === ResourceActivityType.ContentSaved &&
    (!resource.revisionTakenAt || Date.now() - resource.revisionTakenAt.getTime() >= SNAPSHOT_INTERVAL_MS)
  )
    await getResultAsync(() => takeResourceRevision(ctx, resource, SnapshotReason.Automatic)).match(
      noop,
      console.error,
    );
  // Parsed here rather than at each door, because this is the door.
  // `content` arrives as `unknown`, and everything downstream reads it as the type's own shape.
  // So an unparsed caller reaches the hook with strings where it declares dates.
  // A blueprint manifest carries content as `z.unknown()`.
  // So a deployed TodoList's `dueAt` is the ISO string its reminder scheduler calls `.getTime()` on.
  // A caller that already parsed pays an idempotent second pass.
  const parsedContent: unknown = ResourceDefinitionMap[resource.type].contentSchema.parse(content);
  // Read before the write overwrites it, so an after-save hook can diff against it (undefined on the first write).
  // Only paid where a hook is registered, and best-effort like the hook itself.
  // An unreadable prior blob degrades to "no previous content" rather than blocking a valid write.
  const previousContent: unknown = ResourceAfterSaveContentMap[resource.type]
    ? await getResultAsync(() =>
        readResourceContent(ResourceDefinitionMap[resource.type].contentSchema, id),
      ).match<unknown>(
        (priorContent) => priorContent,
        // An unreadable prior blob is no previous content, so the write it would diff against still goes through
        () => undefined,
      )
    : undefined;
  // Whether the upload was attempted decides how a failed save unwinds, not whether it resolved.
  // An upload that rejects may still have landed the blob.
  // The mistakes are unequal: clearing links whose upload never landed costs their reads until the next save.
  // Leaving ones whose upload did land fails open.
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
  // What the blob holds once decoded: the hash, so the client can tell whether the bytes it sent are the bytes stored.
  // A delta save is computed against exactly these.
  // The size is the one a read picks its transport by.
  // Both describe the JSON rather than the frame it is stored as.
  // Written with the blob, so neither ever describes bytes that were not stored.
  const contentHash = getContentAddress(serializedContent);
  const contentSize = Buffer.byteLength(serializedContent);
  // The content's links are projected here rather than in an after-save hook, which is best-effort by contract.
  // They are kept in step with the blob.
  // `resolveIdentifiedToken` reads them to decide whether a participant token was issued for the survey being answered.
  // So a link that lags its blob authorizes against content that is gone.
  // One still naming an unbound survey answers yes to a revoked token.
  const getResourceLinkTargets = ResourceTypeGetLinkTargetsMap.get(resource.type);
  const resourceLinkTargets = getResourceLinkTargets?.(parsedContent) ?? [];
  // Only when the set moved: most saves leave a resource's links alone.
  // A type declaring none never reads them, so neither pays for a write.
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
  // A save's links are a set its content version names.
  // The clear and the write are guarded on that version.
  // So a save superseded since it established its version clears nothing and writes nothing.
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
  // The clear and the write are one batch, with the write guarded on the version as the clear is.
  // So the set is either the one this save wrote or the one the save that superseded it wrote.
  const writeResourceLinks = (expectedContentVersion: number) => {
    const now = Date.now();
    return ctx.db.batch([
      clearResourceLinks(isCurrentContentVersion(expectedContentVersion)),
      ctx.db.insert(resourceLinksInResource).select(
        ctx.db
          .select({
            createdAt: epochMsSql(now).as("createdAt"),
            sourceId: sql<ResourceInResource["id"]>`${id}`.as("sourceId"),
            targetId: sql<string>`json_extract(link.value, '$.targetId')`.as("targetId"),
            type: sql<ResourceLinkInResource["type"]>`json_extract(link.value, '$.type')`.as("type"),
            updatedAt: epochMsSql(now).as("updatedAt"),
          })
          .from(sql`json_each(${JSON.stringify(resourceLinkTargets)}) AS link`)
          .where(isCurrentContentVersion(expectedContentVersion)),
      ),
    ]);
  };
  // The links are cleared before the upload and written after the charge.
  // So they never claim what the blob does not back.
  // A cleared set rejects the survey's tokens until the next save that lands writes it again.
  // Every partial outcome lands there rather than on a stale set:
  // - The version check loses to a concurrent save: nothing was claimed, so no link is cleared.
  // - The upload fails: the version bump is put back and the links are cleared.
  //   For an unbind the content may have landed, and keeping the old set would be fail-open.
  // - It succeeds: the new links are written after, once the content they describe is durable.
  // The assets the content embeds are named by the working copy's reference rows before the upload.
  // They are settled to those rows after it.
  // They are scanned from the serialized content, the bytes the blob is written from.
  const assetHashes = getSnapshotAssetHashes(serializedContent);
  await reserveWorkingAssets(ctx.db, id, assetHashes);
  // The bump is claimed before the upload, so a save that loses the version check writes no content.
  // A failed upload puts it back.
  // So a write that did not land never leaves a version every client caches against advanced.
  // A first write has no version to protect and claims none.
  let savedResource: ResourceInResource;
  // The rows dropped once the blob has landed, released after the write so a dropped asset is collected like any other
  let removedAssetHashes: string[] = [];
  if (contentVersion === undefined) {
    if (hasResourceLinksChanged) await clearResourceLinks();
    await writeContentBlob();
    await ctx.db
      .update(resourcesInResource)
      .set({ contentHash, contentSize })
      .where(getOwnedLiveResourceWhere(resource.userId, id));
    removedAssetHashes = await pruneWorkingAssets(ctx.db, id, assetHashes);
    savedResource = { ...resource, contentHash, contentSize };
  } else {
    // One statement for every column the save moves, with the version check part of it.
    // So concurrent saves cannot both pass and silently lose one write.
    const [updatedResource] = await ctx.db
      .update(resourcesInResource)
      .set({ contentHash, contentSize, contentVersion: contentVersion + 1 })
      .where(
        and(getOwnedLiveResourceWhere(resource.userId, id), eq(resourcesInResource.contentVersion, contentVersion)),
      )
      .returning();
    if (!updatedResource) throw new TRPCError({ code: "BAD_REQUEST", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });
    savedResource = updatedResource;
    if (hasResourceLinksChanged) await clearResourceLinks(isCurrentContentVersion(savedResource.contentVersion));
    await getResultAsync(async () => {
      await writeContentBlob();
      removedAssetHashes = await pruneWorkingAssets(ctx.db, id, assetHashes);
    }).match(noop, async (error) => {
      // Put back only while it is still this save's bump, matched on the owner and id rather than the live row.
      // So a resource binned since the bump is put back too.
      // The failure clears links whichever way the upload went.
      await getResultAsync(() =>
        ctx.db
          .update(resourcesInResource)
          .set({ contentHash: resource.contentHash, contentSize: resource.contentSize, contentVersion })
          .where(
            and(
              ownedBy(resourcesInResource, id, resource.userId),
              eq(resourcesInResource.contentVersion, savedResource.contentVersion),
            ),
          ),
      ).match(noop, console.error);
      if (hasResourceLinksChanged && isContentBlobWriteAttempted) await clearResourceLinks();
      throw error;
    });
  }
  // The owner is charged for their own content as for any upload, from here because this write knows its size.
  // A blob with no reserve behind it has no ledger row for the object-create notification to find.
  // `resource.userId`, not the caller: a blueprint deploy or a restore writes on the owner's behalf.
  // After the content write, because the charge takes the ledger row's lock and then the user's.
  // A save that kept its writes open across those would be a connection waiting on locks it will not release.
  // See openspec/specs/resource/storage-quotas/design.md.
  await chargeAndEmitStorageLedgerEntry(
    ctx.db,
    resource.userId,
    StorageBucket.ResourceAssets,
    contentBlobName,
    storedContentSize,
  );
  // Guarded on the version this save established: the bump is what orders two saves.
  // This write lands after the bump, so unguarded a save that committed first could overwrite a later one's links.
  // A failed write clears the set rather than keeping the previous one, which the committed content no longer backs.
  if (hasResourceLinksChanged)
    await getResultAsync(() => writeResourceLinks(savedResource.contentVersion)).match(noop, async (error) => {
      await clearResourceLinks();
      throw error;
    });

  // Best-effort like every release.
  // A failed one leaves a dropped asset stored and charged until a release names it again.
  await getResultAsync(() => releaseResourceAssets(ctx.db, id, removedAssetHashes)).match(noop, console.error);
  // Not awaited: a failure costs one activity row.
  // The coalescing scan it does would otherwise land on every write the user is waiting on.
  if (activityType) getSynchronizedFunction(writeResourceActivity)(ctx, { activityType, resourceId: id });
  runAfterSaveResourceContent(ctx, savedResource, parsedContent, previousContent);
  return savedResource;
};
