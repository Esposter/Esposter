import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";

import { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import { SNAPSHOT_IDLE_WINDOW_MS } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { ResourceAfterSaveContentMap } from "@@/server/services/resource/ResourceAfterSaveContentMap";
import { ResourceBoundResourceIdMap } from "@@/server/services/resource/ResourceBoundResourceIdMap";
import { runAfterSaveResourceContent } from "@@/server/services/resource/runAfterSaveResourceContent";
import { takeResourceRevision } from "@@/server/services/resource/snapshot/takeResourceRevision";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { chargeAndEmitStorageLedgerEntry } from "@@/server/services/storage/chargeAndEmitStorageLedgerEntry";
import { getContentBlobName } from "@esposter/db";
import { AzureContainer, ResourceActivityType, resources } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

interface SaveResourceContentInput {
  // What the trail records for this write. Omitted where `createResourceRow` has already opened the trail with
  // The entry saying how the resource came to exist — a `ContentSaved` beside a `Duplicated` would claim the
  // Owner edited a resource they have not opened yet
  activityType?: ResourceActivityType.ContentSaved | ResourceActivityType.Restored;
  // What the blob now holds, already asset-cloned where the content came from somewhere else, since this is
  // What every reader gets back
  content: unknown;
  resource: Resource;
  // Bumps `contentVersion` inside the same transaction as the blob write, and returns the updated row.
  // Omitted for a resource's first content write, where there is no version any client caches yet
  updateContentVersion?: (tx: Transaction) => Promise<Resource>;
}
// The durable write and everything that must follow it, as one unit: the save event, the activity entry and the
// Type's after-save hook. Every door — editor save, blueprint deploy, duplicate, restore — writes through here,
// So a resource's reminders, schedules and derived state cannot depend on which door its content came through
export const saveResourceContent = async (
  ctx: AuthedContext,
  { activityType, content, resource, updateContentVersion }: SaveResourceContentInput,
): Promise<Resource> => {
  const { id } = resource;
  // The first save after a quiet spell keeps a point the owner can return to; every save inside the window keeps
  // None. Ordinary saves only — a restore and a blueprint deploy take their own, and a first write has no prior
  // State. Before the write, since what is worth keeping is what this save replaces, and awaited so a revision
  // Cannot snapshot the content it was meant to precede. Best-effort only here: a failed safety net must not fail
  // The autosave it was protecting, where every other trigger throws to keep one deliberate destructive act
  // Undoable (/docs/platform/resource-snapshots)
  if (
    activityType === ResourceActivityType.ContentSaved &&
    Date.now() - resource.updatedAt.getTime() >= SNAPSHOT_IDLE_WINDOW_MS
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
  // Since an upload that rejects may still have landed the blob. The mistakes are unequal: clearing a binding
  // Whose upload never landed costs one fallback blob read, leaving one whose upload did land fails open
  let isContentBlobWriteAttempted = false;
  const serializedContent = JSON.stringify(parsedContent);
  const contentBlobName = getContentBlobName(id);
  const writeContentBlob = async () => {
    isContentBlobWriteAttempted = true;
    await useUpload(AzureContainer.ResourceAssets, contentBlobName, serializedContent);
  };
  // Projected here rather than in an after-save hook, which is best-effort by contract, and written in the
  // Transaction the blob is: `resolveIdentifiedToken` reads this column to decide whether a participant token was
  // Issued for the survey being answered, so a binding that lags its blob authorizes against content that is
  // Gone, and one still naming an unbound survey answers yes to a revoked token
  const projectBoundResourceId = ResourceBoundResourceIdMap[resource.type];
  const boundResourceId = projectBoundResourceId?.(parsedContent as never) ?? null;
  // Only when it moved: most saves to a bound type leave the binding alone, and an unbound type has no
  // Projector at all, so neither pays for a write
  const hasBoundResourceIdChanged = Boolean(projectBoundResourceId) && boundResourceId !== resource.boundResourceId;
  // `expectedContentVersion` makes the write lose to a newer save the way the version bump itself does. The
  // Clears pass none: null is the value that can never be wrong, so a clear is safe to apply unconditionally
  const writeBoundResourceId = async (
    db: Context["db"] | Transaction,
    value: null | string,
    expectedContentVersion?: number,
  ) =>
    (
      await db
        .update(resources)
        .set({ boundResourceId: value })
        .where(
          expectedContentVersion === undefined
            ? eq(resources.id, id)
            : and(eq(resources.id, id), eq(resources.contentVersion, expectedContentVersion)),
        )
        .returning()
    )[0];
  // The binding is cleared inside the transaction and set after it commits, so it never holds a value the blob
  // Does not back. `resolveIdentifiedToken` reads null as "ask the blob", making null the one value that can
  // Never be wrong — which is what every partial outcome lands on:
  //
  // - the version check loses to a concurrent save: the clear rolls back with it, so the winner's binding stands
  // - the transaction fails after the upload: the rollback restores a binding for content that is already gone,
  //   Which for an unbind is fail-open, so the clear is reapplied outside the transaction
  // - it commits: the new binding is written after, once the content it describes is durable
  //
  // The bump and the blob share one transaction so a failed write rolls the bump back — a write that did not land
  // Must never advance the version every client caches against. A first write has no version to protect, and
  // Wrapping it would hold a pooled connection across a storage round trip
  let savedResource = resource;
  if (updateContentVersion)
    savedResource = await getResultAsync(() =>
      ctx.db.transaction(async (tx) => {
        const updatedResource = await updateContentVersion(tx);
        if (hasBoundResourceIdChanged) await writeBoundResourceId(tx, null);
        await writeContentBlob();
        return updatedResource;
      }),
    ).match(
      (updatedResource) => updatedResource,
      async (error) => {
        if (hasBoundResourceIdChanged && isContentBlobWriteAttempted) await writeBoundResourceId(ctx.db, null);
        throw error;
      },
    );
  else {
    if (hasBoundResourceIdChanged) await writeBoundResourceId(ctx.db, null);
    await writeContentBlob();
  }
  // The owner is charged for their own content as for any upload, from here because this write knows its size
  // And a blob with no reserve behind it has no ledger row for `BlobCreated` to find. `resource.userId`, not the
  // Caller: a blueprint deploy or a restore writes on the owner's behalf. After the transaction, because the
  // Charge takes the ledger row's lock and then the user's, and a save's transaction held open across those is a
  // Connection waiting on locks it will not release (/docs/platform/storage-quotas)
  await chargeAndEmitStorageLedgerEntry(
    ctx.db,
    resource.userId,
    AzureContainer.ResourceAssets,
    contentBlobName,
    Buffer.byteLength(serializedContent),
  );
  // Guarded on the version this save established: the bump is what orders two saves, and this write lands after
  // The transaction that made it, so unguarded a save that committed first could overwrite a later one's binding.
  // No row back means superseded
  if (hasBoundResourceIdChanged)
    savedResource =
      (await writeBoundResourceId(ctx.db, boundResourceId, savedResource.contentVersion)) ?? savedResource;

  resourceEventEmitter.emit("saveResourceContent", [
    { content: parsedContent, contentVersion: savedResource.contentVersion, id },
    { sessionId: ctx.getSessionPayload.session.id, userId: ctx.getSessionPayload.user.id },
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
