import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Context } from "@@/server/trpc/context";
import type { Transaction } from "@@/server/models/db/Transaction";
import type { Resource, ResourceActivityType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { ResourceAfterSaveContentMap } from "@@/server/services/resource/ResourceAfterSaveContentMap";
import { ResourceBoundResourceIdMap } from "@@/server/services/resource/ResourceBoundResourceIdMap";
import { runAfterSaveResourceContent } from "@@/server/services/resource/runAfterSaveResourceContent";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { getContentBlobName } from "@esposter/db";
import { AzureContainer, resources } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { eq } from "drizzle-orm";

interface SaveResourceContentInput {
  // What the trail records for this write. Omitted only where `createResourceRow` has already opened the trail
  // With the entry that says how the resource came to exist — a `ContentSaved` beside a `Duplicated` or a
  // Blueprint deploy's `Created` would claim the owner edited a resource they have not opened yet
  activityType?: ResourceActivityType.ContentSaved | ResourceActivityType.Restored;
  // What the blob now holds, already asset-cloned where the path took its content from somewhere else, since
  // That is what every reader — the hook, the other devices, the next load — gets back
  content: unknown;
  resource: Resource;
  // Bumps `contentVersion` inside the same transaction as the blob write, and returns the updated row.
  // Omitted for a resource's first content write, where there is no version any client caches yet
  updateContentVersion?: (tx: Transaction) => Promise<Resource>;
}
// The durable write and everything that must follow it, as one unit — the save event that keeps the owner's
// Other devices live, the activity entry, and the type's registered after-save hook. The editor's save,
// Blueprint deploy, duplicate and restore all write their content through here, so none of them can write
// Content while silently missing one of those; the alternative is a resource whose reminders, schedules or
// Derived state exist or not depending on which door its content came through
export const saveResourceContent = async (
  ctx: AuthedContext,
  { activityType, content, resource, updateContentVersion }: SaveResourceContentInput,
): Promise<Resource> => {
  const { id } = resource;
  // The content is parsed here rather than at each door, because this is the door: `content` arrives as
  // `unknown` and everything downstream — the blob, the save event, the type's after-save hook — reads it as
  // The type's own shape, so a caller that hands over content it never parsed reaches the hook with strings
  // Where it declares Dates (a blueprint manifest carries every entry's content as `z.unknown()`, so a
  // Deployed TodoList's `dueAt` is the ISO string its reminder scheduler calls `.getTime()` on). Parsing at
  // The one path means no caller can be the one that forgets, and a caller that already parsed pays an
  // Idempotent second pass
  const parsedContent: unknown = ResourceDefinitionMap[resource.type].contentSchema.parse(content);
  // Read the prior content before the write overwrites it, so an after-save hook can diff against it
  // (undefined on the first write). Only paid when a hook is registered for this type. Best-effort: the hook
  // Itself is best-effort, so an unreadable or schema-invalid prior blob degrades to "no previous content"
  // Instead of blocking the write of valid new content
  const previousContent: unknown = ResourceAfterSaveContentMap[resource.type]
    ? await getResultAsync(() =>
        readResourceContent(ResourceDefinitionMap[resource.type].contentSchema, id),
      ).match<unknown>(
        (priorContent) => priorContent,
        () => undefined,
      )
    : undefined;
  // Whether the upload was *attempted*, which is what decides how a failed save unwinds. Not whether it resolved:
  // An upload that rejects may still have landed the blob (a response lost after the write), and the two mistakes
  // Are not equal — clearing a binding whose upload never landed costs one fallback blob read, while leaving one
  // Whose upload did land is the fail-open case this whole dance exists to prevent
  let isContentBlobWriteAttempted = false;
  const writeContentBlob = async () => {
    isContentBlobWriteAttempted = true;
    await useUpload(AzureContainer.ResourceAssets, getContentBlobName(id), JSON.stringify(parsedContent));
  };
  // Projected here rather than in an after-save hook, and written in the same transaction as the blob. Every
  // Hook in `ResourceAfterSaveContentMap` is best-effort by contract, and this column is read by
  // `resolveIdentifiedToken` to decide whether a participant token was issued for the survey being answered —
  // A binding that lags its blob is an authorization answer computed from content that is no longer there,
  // And one still naming an unbound survey answers yes to a token the owner has already revoked
  const projectBoundResourceId = ResourceBoundResourceIdMap[resource.type];
  const boundResourceId = projectBoundResourceId?.(parsedContent as never) ?? null;
  // Only when it moved: most saves to a bound type leave the binding alone, and an unbound type has no
  // Projector at all, so neither pays for a write
  const hasBoundResourceIdChanged = Boolean(projectBoundResourceId) && boundResourceId !== resource.boundResourceId;
  const writeBoundResourceId = async (db: Context["db"] | Transaction, value: null | string) =>
    (await db.update(resources).set({ boundResourceId: value }).where(eq(resources.id, id)).returning())[0];
  // The binding is cleared inside the transaction and set after it commits, and never holds a value the blob does
  // Not back. `resolveIdentifiedToken` reads null as "ask the blob", so null is the one value that can never be
  // Wrong — which makes it what every partial outcome has to land on:
  //
  // - the version check loses to a concurrent save: the clear rolls back with it, so the winner's binding stands
  //   Rather than being flattened by the save that lost
  // - the transaction fails after the upload: the rollback restores a binding describing content that is already
  //   Gone, which for an unbind is fail-open — so the clear is reapplied outside the transaction
  // - it commits: the new binding is written after, once the content it describes is durable
  //
  // The bump and the blob stay in one transaction so a failed write rolls the bump back — a write that did not
  // Land must never advance the version every client caches against. A first write has no version to protect,
  // And wrapping it would only hold a pooled connection across a storage round trip
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
  if (hasBoundResourceIdChanged) savedResource = (await writeBoundResourceId(ctx.db, boundResourceId)) ?? savedResource;

  resourceEventEmitter.emit("saveResourceContent", [
    { content: parsedContent, contentVersion: savedResource.contentVersion, id },
    { sessionId: ctx.getSessionPayload.session.id, userId: ctx.getSessionPayload.user.id },
  ]);
  // Fire-and-forget: the activity trail is best-effort and autosave must not pay its coalescing table scan
  // On every write the user is waiting on
  if (activityType)
    getSynchronizedFunction(writeResourceActivity)({
      activityType,
      resourceId: id,
      userId: ctx.getSessionPayload.user.id,
    });
  runAfterSaveResourceContent(ctx, savedResource, parsedContent, previousContent);
  return savedResource;
};
