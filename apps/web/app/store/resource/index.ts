import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ContentBaseline } from "#src/models/resource/ContentBaseline";
import type { ResourceSave } from "#src/models/resource/ResourceSave";
import type {
  ResourceInResource,
  ResourcePublicationInResource,
  ResourceTags,
  ResourceType,
} from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { MAX_REQUEST_SIZE } from "#shared/services/app/constants";
import { checkIsUuidV7 } from "#shared/services/id/checkIsUuidV7";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { MAX_RESOURCE_CONTENT_SIZE, STALE_CONTENT_VERSION_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { CacheTag } from "#src/models/cache/CacheTag";
import { ResourceSaveState } from "#src/models/resource/ResourceSaveState";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { getFileSize } from "#src/services/file/getFileSize";
import { copyLinkToClipboard } from "#src/services/resource/copyLinkToClipboard";
import { publicationTable, resourceTable } from "#src/services/resource/overlay/constants";
import { getDeleteResourcesEntry } from "#src/services/resource/overlay/getDeleteResourcesEntry";
import { getHeldResource } from "#src/services/resource/overlay/getHeldResource";
import { getPublicationPatchEntry } from "#src/services/resource/overlay/getPublicationPatchEntry";
import { getResourcePatchEntry } from "#src/services/resource/overlay/getResourcePatchEntry";
import { getSaveResourceEntry } from "#src/services/resource/overlay/getSaveResourceEntry";
import { readStoredResourceContent } from "#src/services/resource/readStoredResourceContent";
import { ResourceContentHookMap } from "#src/services/resource/ResourceContentHookMap";
import { saveResourceContentDelta } from "#src/services/resource/saveResourceContentDelta";
import { saveStagedResourceContent } from "#src/services/resource/saveStagedResourceContent";
import { getSha256Hex } from "#src/services/shared/getSha256Hex";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { rethrowFailedRead } from "#src/services/shared/rethrowFailedRead";
import { getRequestBodyByteLength } from "#src/services/trpc/getRequestBodyByteLength";
import { useCacheStore } from "#src/store/cache";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { getRouteParam } from "#src/util/router/getRouteParam";
import { NotificationSeverity } from "@esposter/db-schema";
import {
  getResultAsync,
  getSynchronizedFunction,
  InvalidOperationError,
  noop,
  Operation,
  RoutePath,
  toRawDeep,
  withFinalizerAsync,
} from "@esposter/shared";

// The resource the blade has open — its row, its publication and the bookkeeping its content saves need.
// One resource is open at a time, so the page shell, the toolbar and whichever content store the type's editor
// Drives all read the same state here instead of the page threading it down through every component between
// Them. Blade-scoped: the store is app-lifetime, this state is not, so the page clears it on unmount
export const useResourceStore = defineStore("resource", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited, writeOptimistic } = overlayStore;
  const resourceRows = view(resourceTable);
  const publicationRows = view(publicationTable);
  const { restoreResources } = useRestoreResources();
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, dismissNotification } = notificationStore;
  const getResourceRouter = useResourceRouter();
  const { currentRoute } = useRouter();
  // Leaving the deleted resource is fire-and-forget: the blade moves on at once and nothing waits for the route to settle
  const navigateToExplorer = getSynchronizedFunction(async () => {
    await navigateTo(RoutePath.ResourceExplorerAll);
  });
  // The open resource is its id. Its row and its publication are held on the overlay, so the blade keeps no copy of either
  const resourceId = ref("");
  // The open resource's row. It is absent until its read lands
  const resource = computed(() => getHeldResource(resourceRows.value, resourceId.value));
  // The key a view's state is filed under — a sheet's page, a panel's list — so it is the loaded resource's own
  // And a switch to another reads that one's instead of carrying this one's across
  const currentResourceId = computed(() => resource.value?.id ?? "");
  // A removed publication is held as a tombstone, and the blade reads it as no publication at all
  const getHeldPublication = (id: string) =>
    publicationRows.value.find(
      (row): row is ResourcePublicationInResource => row.resourceId === id && row.version !== undefined,
    );
  const publication = computed(() => {
    const heldPublication = getHeldPublication(resourceId.value);
    return heldPublication?.deletedAt ? undefined : heldPublication;
  });
  // A write is keyed by the resource it targets, not by whichever one the blade has open when it settles, so
  // Everything it applies — an optimistic value, the server's row — lands only while that resource is still the loaded one.
  // Applied to another, it would carry the first resource's fields into the second
  const checkIsLoaded = (id: string) => currentResourceId.value === id;
  // The save in flight for each resource, with the settlement a caller waits on. Saves of one resource are ordered on the
  // Overlay, so the settlement of the latest is the settlement of all of them
  const contentSaves = ref(new Map<string, Promise<void>>());
  const checkIsSavePending = (id: string) => contentSaves.value.has(id);
  const whenContentSaved = (id: string) => contentSaves.value.get(id) ?? Promise.resolve();
  // The publication and duplicate writes in flight, counted, since the page's buttons are disabled while one is out
  const pendingPublicationCount = ref(0);
  const isPublicationPending = computed(() => pendingPublicationCount.value > 0);
  const pendingDuplicateCount = ref(0);
  const isDuplicatePending = computed(() => pendingDuplicateCount.value > 0);

  // The resource the in-memory content belongs to. A content store fills its own ref from readContent, so that
  // Read is the moment the content in hand becomes this resource's — and it stays the previous resource's for
  // The whole of a read plus the await that follows it
  let contentResourceId = "";
  // The open row a save in flight held back from the comparison, until the saves of its resource settle
  let heldOtherRow: ResourceInResource | undefined;
  // Which opening of the resource the state belongs to. Closing a resource and reopening it loads the same id,
  // So an id cannot tell a content read or a save the first opening issued from one of the reopened blade's —
  // Landed on the reopened one, it would hand that blade content older than the row it just read, and its next
  // Save would write that content under the fresh contentVersion. A refresh of the open resource is the same
  // Opening: its in-flight writes are still the ones on screen
  let opening = Symbol("opening");
  const getOpening = () => opening;
  // The latest content read issued. A restore re-reads within the one opening, so the opening alone cannot drop a
  // Read issued before the restore that lands after it: taken then, it would replace the restored content and the
  // Baseline it was persisted against with the document from before
  let latestContentRead = Symbol("contentRead");
  // The last content shape known to be persisted — saveContent() skips the write when nothing changed, so a
  // Load-echoed autosave or an unedited explicit save never bumps contentVersion over the wire.
  // Content stores seed it after hydrating so the first debounced watch tick has something to compare against
  let persistedContentJson = "";
  // The hash of the content the store holds: the hash of the row it read the content under, or the one its own save was
  // Stored as. The open row names the hash of the content its latest write left, so a row that names this one names no
  // Content the store lacks
  let persistedContentHash: string | undefined;
  // The version of each resource's content the opening confirmed: the one a read of its content was taken at, or the one a
  // Save of that opening wrote. A save sends that version whether or not its resource is loaded, and never a row's version,
  // Since a row another device moved on, or a Recent read brought, can be ahead of the content in hand. Held per opening, so
  // A reopened read's version never reaches a save its own opening left queued
  let confirmedContentVersions = new Map<string, number>();
  // A new opening takes its own identity and no confirmed versions, so nothing the one before it issued reaches it
  const startOpening = () => {
    opening = Symbol("opening");
    confirmedContentVersions = new Map<string, number>();
  };
  // Held while the resource is loaded or a save of it is queued, and dropped once neither holds, so the map does not grow
  // Across the resources a session opens. The content in hand belongs to a resource only while its version is held, so
  // Dropping the version drops that claim too: reopening the resource reads its content again rather than saving it without a version.
  // A save queued past its opening keeps the map that opening held, which is why this drop never reaches it
  const forgetConfirmedContentVersion = (id: string) => {
    if (checkIsLoaded(id) || checkIsSavePending(id)) return;

    confirmedContentVersions.delete(id);
    if (contentResourceId === id) contentResourceId = "";
  };
  // The stored bytes this client holds — read straight from R2, or sent by a save whose hash the server
  // Confirmed — which is what a large document's next save is compressed against. Not reactive and not persisted:
  // Nothing renders it, and a reload reads the bytes afresh
  let contentBaseline: ContentBaseline | undefined;
  // A stale contentVersion can only be cured by reloading, so once the server rejects a save every
  // Retry is a guaranteed rejection — the flag turns saveContent() into a no-op (and the warning into a
  // One-shot) until the next read of the open resource reads a fresh version. A ref because the toolbar renders it:
  // "out of date" is the one save state the owner has to act on
  const isContentStale = ref(false);
  // Another device's save held behind an unwritten edit, until the person answers the notice. The stale latch holds
  // Autosave in the meantime; this is what the notice shows and answers
  const heldSave = ref<ResourceSave>();
  // Whether the last content save did not land: its write was rejected for any other reason, or an editor's own check
  // Refused it before any write. Its notification is a one-shot the owner dismisses; this is what keeps saying so
  // Afterwards, because a failed save leaves work only in the tab
  const isSaveContentFailed = ref(false);
  // The resource an edit the debounce is holding was made on, until a write of that resource takes it. A flag rather
  // Than a count of armed debounces: a save writes the whole content blob, so one write cleans every edit waiting on
  // This resource however many watchers observed them — a count would claim two pending saves where there is one. Set
  // Where the edit is seen rather than derived from the content, because deriving it means serializing the whole blob
  // On every keystroke, which is the cost the debounce exists to avoid; the write clears it and
  // `persistedContentJson` takes over from there. Keyed by resource so that loading another one cannot clear it, which
  // Would report an edit the app never wrote as saved
  const unwrittenContentResourceId = ref("");
  // Whether the loaded resource is the one an edit is held for. The empty sentinel is no edit, and it is also what
  // The current resource id reads when none is loaded, so it is excluded rather than matched
  const hasUnwrittenContent = computed(
    () => Boolean(unwrittenContentResourceId.value) && unwrittenContentResourceId.value === currentResourceId.value,
  );
  // Every type's edits land through saveContent, so the state every type shows is derived here rather than
  // Declared per type — a third-party editor autosaving on its own cadence, a toolbar command and a dialog's
  // Save are the same write. See openspec/specs/resource/resource-save-state/design.md
  const saveState = computed(() => {
    if (isContentStale.value) return ResourceSaveState.Stale;
    // Asked of this resource rather than of every save: one issued before the blade moved on is still in flight, and read
    // In aggregate it would show this resource saving work that belongs to another
    else if (checkIsSavePending(currentResourceId.value) || hasUnwrittenContent.value) return ResourceSaveState.Saving;
    else if (isSaveContentFailed.value) return ResourceSaveState.Failed;
    else return ResourceSaveState.Saved;
  });
  // The block a row lands in, whichever read fetched it. A row that is not the one open starts a new opening, and takes
  // The content state with it: a fresh row carries the current contentVersion, so saving is meaningful again, and what it
  // Carries is by definition what is written
  const assignResource = (newResource: ResourceInResource, newPublication: null | ResourcePublicationInResource) => {
    if (!checkIsLoaded(newResource.id)) startOpening();
    resourceId.value = newResource.id;
    const isResourceApplied = arrive(resourceTable, newResource);
    if (newPublication) arrive(publicationTable, newPublication);
    // A reload answer the gate discards is older than the row held, so the newer state a read or a save left stands
    if (!isResourceApplied) return;

    isContentStale.value = false;
    heldSave.value = undefined;
    isSaveContentFailed.value = false;
  };

  // A content reload follows a re-read of the row, so the row it takes is the version the reloaded content is read at.
  // Tracked on its own executor so the page's Refresh shows the read in flight, and one key so repeated clicks queue
  // Rather than overlap
  const { executeQuery: executeReloadQuery, isPending: isReloadPending } = useMutation();
  const reloadRunScope = useRunScope();
  const reloadKey = Symbol("reloadResource");
  const reloadResource = async () => {
    // A route with no resource segment names nothing to read, and the empty sentinel would reach the server as a uuid
    // That fails validation
    const id = getRouteParam(currentRoute.value.params, "id");
    if (!checkIsUuidV7(id)) return;

    await rethrowFailedRead(
      executeReloadQuery(() => $trpc.resource.readResource.query({ id }), {
        // The store outlives the page, and the page's own read keeps the open row live, so this one-shot read holds no watch
        isUnwatched: true,
        key: reloadKey,
        onSuccess: ({ publication: newPublication, ...newResource }) => {
          // Reads for two resources are not one target, so a navigation away can let the earlier one land last
          if (getRouteParam(currentRoute.value.params, "id") !== id) return;

          assignResource(newResource, newPublication);
        },
        runScope: reloadRunScope,
      }),
    );
  };
  // The page that opened this resource takes its state back down when it closes. A keyed page swap mounts the
  // Next resource's page before this one unmounts, so the teardown fires only while the state is still the one
  // The caller loaded — otherwise closing A would blank the B the swap has already loaded
  const clearResource = (id: string) => {
    if (resourceId.value && resourceId.value !== id) return;

    resourceId.value = "";
    startOpening();
    heldOtherRow = undefined;
    contentResourceId = "";
    persistedContentJson = "";
    persistedContentHash = undefined;
    contentBaseline = undefined;
    isContentStale.value = false;
    heldSave.value = undefined;
    isSaveContentFailed.value = false;
    unwrittenContentResourceId.value = "";
    forgetConfirmedContentVersion(id);
  };

  // This resource's content was replaced underneath whatever blade is open — a restore is the one write that
  // Does that. The row is re-read here and the content stores re-read themselves through the hook registry,
  // Rather than the blade being keyed on a counter something bumps: which store holds the content is the
  // Type's business, and a blade left holding the pre-restore draft has its own next save rejected as stale.
  // The two stages are sequential because the second reads what the first landed: a registry runs its own
  // Hooks together, so a third-party editor adopting the store's content cannot be a peer of the re-read
  // That fills it (openspec/specs/architecture/third-party-document-adapters/design.md)
  const reloadResourceContent = async () => {
    await reloadResource();
    if (!resource.value) return;

    await ResourceContentHookMap.Reload.run(resource.value.type);
    await ResourceContentHookMap.Adopt.run(resource.value.type);
  };
  // Another device's document is adopted in place of this client's. The bytes it held name the document the save
  // Replaced, so the next large save crosses whole. Cleared after the re-read, which may itself have held the large
  // Document's bytes
  const adoptResourceContent = async () => {
    await reloadResourceContent();
    contentBaseline = undefined;
  };
  // The blob is written on first save, so a freshly created resource returns undefined content.
  // The dispatch reads the loaded row's own type, so the procedure resolves to the union of every type's
  // Content read — narrowing it to TType is the calling content store's claim about which resources it opens,
  // Which is the same claim the blade route guard enforces.
  // The content reaches the caller only through `applyContent`, which runs while the read is still the latest one
  // Issued for the opening that issued it, so a store has no way to take content without that check having passed
  const readContent = async <TType extends ResourceType = ResourceType>(
    applyContent: (content: ResourceContent<TType> | undefined) => void,
  ) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { contentHash, contentSize, contentVersion, id, type } = resourceValue;
    const readOpening = opening;
    const contentRead = Symbol("contentRead");
    latestContentRead = contentRead;
    const resourceRouter = getResourceRouter(type);
    // A read crosses the way a save of the same document would: through the server while one body carries it,
    // Straight from R2 above that (openspec/specs/architecture/large-documents/design.md). The stored bytes are then the
    // Delta baseline as well, so a session's first large save can already be a delta
    let storedContent: ContentBaseline | undefined;
    let content: unknown;
    if (contentSize >= MAX_REQUEST_SIZE) {
      const bytes = await readStoredResourceContent(resourceRouter, id);
      storedContent = { bytes, hash: await getSha256Hex(bytes), id };
      const serializedContent = new TextDecoder().decode(bytes);
      // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, so free-text ISO strings survive
      content = ResourceDefinitionMap[type].contentSchema.parse(JSON.parse(serializedContent));
    } else content = await resourceRouter.readResourceContent.query({ id });
    // A read that lands after the blade moved on — to another resource, to a reopening of this one, or past a later
    // Read of the same opening — holds content that is not the open blade's
    if (opening !== readOpening || latestContentRead !== contentRead) return;

    contentResourceId = id;
    // The hash is the row's as it was before the blob was read, so a save that lands during the read leaves the hash behind
    // The content, and the next refetch of the row reads it again rather than missing it
    persistedContentHash = contentHash;
    confirmedContentVersions.set(id, contentVersion);
    if (storedContent) contentBaseline = storedContent;
    applyContent(content as ResourceContent<TType> | undefined);
  };
  // Every blade of a resource renders the one content, so it is read once per opened resource rather than once
  // Per blade mount — switching blades renders from the store at once. What changes it after that is the store's own
  // Saves, the page's watch of the open row, which re-reads the content only for a hash the store does not hold, and a
  // Restore through `reloadResourceContent`. Closing the resource resets it, so reopening reads afresh
  const checkIsContentRead = () => contentResourceId === resource.value?.id;
  // Every content store calls this once its load has hydrated, and the editors' stores have to: the editor
  // Stores as soon as it finishes loading, so the first save of a session is an echo of what was just read.
  // Unseeded, that echo counts as a change — it bumps contentVersion for content nobody edited, and every
  // Other client holding the page open is then told its version is stale
  const setPersistedContent = (content: ResourceContent<ResourceType>) => {
    persistedContentJson = JSON.stringify(content);
  };
  // Another writer changed the content the store holds: the open row names a hash the store does not hold. The content is
  // Adopted through the two stages a restore runs, which the reload leaves to adopt the document. Taken through a
  // Synchronized function, so the adoption is awaited by whatever drains the store's work, and a failed read is logged
  // Rather than left unhandled
  const adoptOtherContent = getSynchronizedFunction(() =>
    getResultAsync(() => adoptResourceContent()).match(noop, console.error),
  );
  // The page's watch of the open row brings the row here, and every write to the content publishes that row, so this is
  // Where another device's save, an agent's and a restore's reach the editor. The blob is read only for a hash the store
  // Does not hold. A row that lands while a save of this store's own is in flight waits: that save's answer sets the hash
  // The row is compared against, and a row another writer committed on top of it is compared once the saves settle, not
  // Dropped. Only the latest row is held, since it names the newest state
  const applyOtherContent = (newResource: ResourceInResource): void => {
    heldOtherRow = undefined;
    if (!checkIsContentRead() || newResource.contentHash === persistedContentHash) return;

    if (checkIsSavePending(newResource.id)) {
      heldOtherRow = newResource;
      getSynchronizedFunction(async () => {
        await whenContentSaved(newResource.id);
        // A newer row, or one applied since, has taken the held row's place, and a save issued meanwhile holds it again
        if (heldOtherRow === newResource) applyOtherContent(newResource);
      })();
      return;
    }

    // The unwritten edit is the person's, so the other save waits for their answer, and the stale latch holds autosave
    // Until then
    if (hasUnwrittenContent.value) {
      heldSave.value = { contentVersion: newResource.contentVersion };
      isContentStale.value = true;
      return;
    }

    adoptOtherContent();
  };
  // The page's read of the open row lands here. A read of the resource already open is a refresh: its row and publication
  // Arrive as any other row does, and the content is then checked against the hash the store holds. A reset would drop the
  // Notice another save is held behind
  const applyResource = (newResource: ResourceInResource, newPublication: null | ResourcePublicationInResource) => {
    if (!checkIsLoaded(newResource.id)) {
      assignResource(newResource, newPublication);
      return;
    }

    arrive(resourceTable, newResource);
    if (newPublication) arrive(publicationTable, newPublication);
    applyOtherContent(newResource);
  };

  // Taking theirs: the other version is adopted and the unwritten edit is dropped with the content it was an edit of
  const takeOtherSave = async () => {
    if (!heldSave.value) return;

    heldSave.value = undefined;
    if (unwrittenContentResourceId.value === currentResourceId.value) unwrittenContentResourceId.value = "";
    await adoptResourceContent();
  };
  // Keeping mine: the version moves to the held save's, so the local document is written over it as the newest version,
  // And the other write stays in history. The stale latch lifts for that one write
  const keepUnwrittenContent = async () => {
    const resourceValue = resource.value;
    if (!resourceValue || !heldSave.value) return;

    confirmedContentVersions.set(resourceValue.id, heldSave.value.contentVersion);
    heldSave.value = undefined;
    isContentStale.value = false;
    await ResourceContentHookMap.Keep.run(resourceValue.type);
  };
  // The content is already on screen, so the save gives its caller nothing to await. A refused save leaves the change on
  // Screen and the state reads Not saved, since a blob write has no optimistic entry and nothing to restore
  const saveContent = (content: ResourceContent<ResourceType>) => {
    const resourceValue = resource.value;
    // Only content read for this resource is written. A debounced autosave can fire after a read swapped
    // In another resource but before the content store has re-seeded its content ref, and the content in hand is
    // Then still the previous resource's; a store that never read at all holds its empty default. Either write
    // Would replace this resource's document with one that is not its own, under this one's id and version
    if (!resourceValue || isContentStale.value || !checkIsContentRead()) return;
    // Cleared here rather than by whichever trigger armed it, because this is the one door every save comes
    // Through — a dialog's Save arms nothing, and a debounce clearing its own would call a save it then refuses
    // Saved (openspec/specs/resource/resource-save-state/design.md). The unchanged-content path below is a save all the same: it
    // Wrote nothing because there was nothing left to write
    if (unwrittenContentResourceId.value === resourceValue.id) unwrittenContentResourceId.value = "";
    const contentJson = JSON.stringify(content);
    // The baseline is the last content the server confirmed, so while a write of this resource is still in flight it
    // Can be about to replace that content — a revert to the baseline has to be written behind it, not skipped
    if (contentJson === persistedContentJson && !checkIsSavePending(resourceValue.id)) {
      // The server already holds this content, so a failed or refused save before it is replaced by this one, and nothing is left unsaved
      isSaveContentFailed.value = false;
      return;
    }
    // The serialization already made for the dirty check is what sizes the document, so a document no resource
    // May hold is refused here rather than sent — the server would refuse it after the whole upload
    const contentBytes = new TextEncoder().encode(contentJson);
    if (contentBytes.byteLength > MAX_RESOURCE_CONTENT_SIZE) {
      isSaveContentFailed.value = true;
      createNotification({
        severity: NotificationSeverity.Error,
        title: `"${resourceValue.name}" is ${getFileSize(contentBytes.byteLength)}, over the ${getFileSize(MAX_RESOURCE_CONTENT_SIZE)} a resource can hold — it was not saved`,
      });
      return;
    }
    // A body under the request limit sends the content object, so it sends the content this save was issued with
    // Rather than the object as it stands when a save queued behind another comes up. Otherwise the server would
    // Hold an edit the persisted baseline does not name, and a revert to the issued content would be skipped
    const issuedContent = contentBytes.byteLength < MAX_REQUEST_SIZE ? structuredClone(toRawDeep(content)) : undefined;
    // Saves of different resources are different writes, so this one can settle after the blade has moved on. What it carries
    // Back is its own resource's: the row it returns reaches the overlay for that row, and the content state is applied only
    // While that resource is still loaded. The notifications are not scoped, since the write failed for the owner either way
    // (openspec/specs/resource/resource-save-state/design.md)
    const { id } = resourceValue;
    // The versions of the opening this save is issued in, so a save left queued when the resource closes keeps reading its own
    const issuedVersions = confirmedContentVersions;
    const { promise: settled, resolve: release } = Promise.withResolvers<void>();
    contentSaves.value.set(id, settled);
    // Released once the outcome is recorded, not by a finalizer: writeOptimistic records a refusal after the write's
    // Promise has settled, so a waiter released on the way out would read the save as not failed
    const settle = () => {
      if (contentSaves.value.get(id) === settled) contentSaves.value.delete(id);
      forgetConfirmedContentVersion(id);
      release();
    };
    writeOptimistic(
      async () => {
        // Read when the write is sent rather than when it was issued: a save that queued behind another carries the version
        // That one answered. It is the version its own opening last confirmed, loaded or not, since a row can land before
        // The other device's save is adopted, and a save sent with that row's version would overwrite it
        const target = getHeldResource(resourceRows.value, id) ?? resourceValue;
        const resourceRouter = getResourceRouter(target.type);
        // The version the content it sends was read or saved at, which is what the server compares. A large save takes the
        // Same pair, so a delta or a staged save never sends a version the row it reads from has not yet been told of
        const contentVersion = issuedVersions.get(id);
        if (contentVersion === undefined)
          throw new InvalidOperationError(Operation.Update, id, "has no confirmed content version");

        const sent = { contentVersion, id: target.id };
        const input = { content: issuedContent, ...sent };
        const baseline = contentBaseline?.id === target.id ? contentBaseline : undefined;
        // A body the server's request size limiter would refuse goes as a delta against the stored bytes when this
        // Client holds them, and staged through R2 otherwise. The body is measured as the transformer
        // Writes it, never as the content's own JSON, which is smaller — but only once the JSON alone is under the
        // Limit, since the body is never smaller than it
        const savedResource =
          contentBytes.byteLength >= MAX_REQUEST_SIZE || getRequestBodyByteLength(input) >= MAX_REQUEST_SIZE
            ? ((baseline && (await saveResourceContentDelta(resourceRouter, contentBytes, baseline, sent))) ??
              (await saveStagedResourceContent(resourceRouter, contentBytes, sent)))
            : // Calling the union of every type's content write needs an argument every arm accepts, so the
              // Content is narrowed the same way the read above widens it
              await resourceRouter.saveResourceContent.mutate(input as never);
        // The server stores its own serialization of the parsed document, which a content schema's transforms can
        // Make differ from what was sent, so the sent bytes become the baseline only when their hash is the one
        // Stored
        const contentHash = await getSha256Hex(contentBytes);
        contentBaseline =
          savedResource.contentHash === contentHash
            ? { bytes: contentBytes, hash: contentHash, id: target.id }
            : undefined;
        // Kept whether or not the resource is still loaded, since a save queued behind this one
        // Carries the version it confirmed
        issuedVersions.set(id, savedResource.contentVersion);
        if (checkIsLoaded(id)) {
          persistedContentJson = contentJson;
          persistedContentHash = savedResource.contentHash;
          isSaveContentFailed.value = false;
        }
        settle();
        return createRowResponse(resourceTable, savedResource);
      },
      {
        // A content save shows no change, so its entry only reads the rows its answer names, which orders it on each
        entry: getSaveResourceEntry(id, userId.value),
        onError: (error) => {
          if (error.message === STALE_CONTENT_VERSION_ERROR_MESSAGE) {
            if (checkIsLoaded(id)) isContentStale.value = true;
            createNotification({
              action: {
                // A hard reload is the one path guaranteed to re-run every blade's content loader
                handler: () => {
                  reloadNuxtApp({ force: true });
                },
                title: "Refresh",
              },
              severity: NotificationSeverity.Warning,
              title: `"${resourceValue.name}" was modified elsewhere — refresh to load the latest`,
            });
          } else {
            if (checkIsLoaded(id)) isSaveContentFailed.value = true;
            createErrorNotification(error);
          }
          settle();
        },
      },
    );
  };

  // An editor's own check refused the save before it reached saveContent, so no write was issued and the edit it held
  // Is dropped rather than landed. The state reads Not saved, and the held edit is cleared as a write would clear it, so
  // It does not keep reading as Saving
  const refuseSaveContent = () => {
    if (unwrittenContentResourceId.value === currentResourceId.value) unwrittenContentResourceId.value = "";
    isSaveContentFailed.value = true;
  };
  const renameResource = (name: string) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { id, type } = resourceValue;
    writeOptimistic(
      async () => {
        const renamedResource = await getResourceRouter(type).updateResource.mutate({ id, name });
        // The favorites and Recent rows carry the name, which nothing else re-reads once they have loaded
        await invalidateTags([CacheTag.Resources]);
        return createRowResponse(resourceTable, renamedResource);
      },
      { entry: getResourcePatchEntry(id, { name }), onError: createErrorNotification },
    );
  };
  // Whole-record replace, which is Azure's own tag update semantics — the dialog always sends every tag. Only the tags are
  // Sent, so an edit queued behind a rename never puts back the name the rename replaced
  const updateResourceTags = (tags: ResourceTags) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { id, type } = resourceValue;
    writeOptimistic(
      async () => {
        const updatedResource = await getResourceRouter(type).updateResource.mutate({ id, tags });
        // The favorites and Recent rows carry the tags, which nothing else re-reads once they have loaded
        await invalidateTags([CacheTag.Resources]);
        return createRowResponse(resourceTable, updatedResource);
      },
      { entry: getResourcePatchEntry(id, { tags }), onError: createErrorNotification },
    );
  };
  const deleteResource = () => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { id, type } = resourceValue;
    // The blade leaves the deleted resource at once, since every action it would send after this is refused
    navigateToExplorer();
    const notificationId = createNotification({
      // The same undo the list's delete leaves, spent once the restore lands
      action: {
        handler: () => {
          restoreResources([resourceValue]);
        },
        isSingleUse: true,
        title: "Restore",
      },
      severity: NotificationSeverity.Success,
      title: ResourceOperationTitleMap[ResourceOperationType.Deleted](resourceValue.name, 1),
    });
    writeOptimistic(
      async () => createRowResponse(resourceTable, await getResourceRouter(type).deleteResource.mutate({ id })),
      {
        entry: getDeleteResourcesEntry([id], new Date()),
        // The resource was never removed, so its Restore is withdrawn
        onError: (error) => {
          dismissNotification(notificationId);
          createErrorNotification(error);
        },
      },
    );
  };
  const duplicateResource = async () => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    pendingDuplicateCount.value++;
    await writeAwaited(
      () =>
        withFinalizerAsync(
          async () => {
            const newResource = await $trpc.resource.duplicateResource.mutate({ id: resourceValue.id });
            createNotification({
              action: { title: "Go to resource", to: RoutePath.Resource(newResource.id) },
              severity: NotificationSeverity.Success,
              title: ResourceOperationTitleMap[ResourceOperationType.Duplicated](newResource.name),
            });
            // The page opens the copy by the id the server gives it
            await navigateTo(RoutePath.Resource(newResource.id));
            return [createArrival(resourceTable, newResource)];
          },
          () => {
            pendingDuplicateCount.value--;
          },
        ),
      { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorNotification },
    );
  };
  const publishResource = () => {
    const resourceValue = resource.value;
    if (!resourceValue || !checkHasCapability(resourceValue.type, "publishable")) return;

    const { id, name, type } = resourceValue;
    const resourceRouter = getResourceRouter(type);
    // Nothing is drawn ahead of the answer: the publication is the server's, so it arrives with its version
    getSynchronizedFunction(() =>
      writeAwaited(
        () => {
          pendingPublicationCount.value++;
          return withFinalizerAsync(
            async () => {
              const newPublication = await resourceRouter.publishResource.mutate({ id });
              createNotification({
                action: { handler: () => copyLinkToClipboard(RoutePath.View(type, id)), title: "Copy public link" },
                severity: NotificationSeverity.Success,
                title: ResourceOperationTitleMap[ResourceOperationType.Published](name, newPublication.publishVersion),
              });
              return [createArrival(publicationTable, newPublication)];
            },
            () => {
              pendingPublicationCount.value--;
            },
          );
        },
        { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorNotification },
      ),
    )();
  };
  const unpublishResource = () => {
    const resourceValue = resource.value;
    if (!resourceValue || !checkHasCapability(resourceValue.type, "publishable")) return;

    const { id, name, type } = resourceValue;
    const resourceRouter = getResourceRouter(type);
    const notificationId = createNotification({
      severity: NotificationSeverity.Success,
      title: ResourceOperationTitleMap[ResourceOperationType.Unpublished](name),
    });
    pendingPublicationCount.value++;
    writeOptimistic(
      () =>
        withFinalizerAsync(
          async () => {
            const removedPublication = await resourceRouter.unpublishResource.mutate({ id });
            // An unpublish that removed nothing answers no row, so its entry is confirmed at once with nothing to arrive
            return removedPublication
              ? createRowResponse(publicationTable, removedPublication)
              : { arrivals: [], confirmed: [] };
          },
          () => {
            pendingPublicationCount.value--;
          },
        ),
      {
        entry: getPublicationPatchEntry(id, { deletedAt: new Date() }),
        onError: (error) => {
          dismissNotification(notificationId);
          createErrorNotification(error);
        },
      },
    );
  };
  return {
    applyResource,
    checkIsContentRead,
    clearResource,
    currentResourceId,
    deleteResource,
    duplicateResource,
    getOpening,
    heldSave,
    isDuplicatePending,
    isPublicationPending,
    isReloadPending,
    keepUnwrittenContent,
    publication,
    publishResource,
    readContent,
    refuseSaveContent,
    reloadResource,
    reloadResourceContent,
    renameResource,
    resource,
    saveContent,
    saveState,
    setPersistedContent,
    takeOtherSave,
    unpublishResource,
    unwrittenContentResourceId,
    updateResourceTags,
    whenContentSaved,
  };
});
