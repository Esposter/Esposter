import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Transaction } from "@@/server/models/db/Transaction";
import type { Resource, ResourceActivityType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { ResourceAfterSaveContentMap } from "@@/server/services/resource/ResourceAfterSaveContentMap";
import { runAfterSaveResourceContent } from "@@/server/services/resource/runAfterSaveResourceContent";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

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
  const writeContentBlob = () =>
    useUpload(AzureContainer.ResourceAssets, getContentBlobName(id), JSON.stringify(parsedContent));
  // The bump and the write stay in one transaction so a failed write rolls the bump back — a write that did
  // Not land must never advance the version every client caches against. A first write has no version to
  // Protect, and wrapping it would only hold a pooled connection across a storage round trip
  let savedResource = resource;
  if (updateContentVersion)
    savedResource = await ctx.db.transaction(async (tx) => {
      const updatedResource = await updateContentVersion(tx);
      await writeContentBlob();
      return updatedResource;
    });
  else await writeContentBlob();

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
