import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ContentBaseline } from "#src/models/resource/ContentBaseline";
import type { ContentSnapshot } from "#src/models/resource/contentSync/ContentSnapshot";
import type { ContentSyncEffect } from "#src/models/resource/contentSync/ContentSyncEffect";
import type { ContentSyncEvent } from "#src/models/resource/contentSync/ContentSyncEvent";
import type { ContentSyncState } from "#src/models/resource/contentSync/ContentSyncState";
import type { ResourceSave } from "#src/models/resource/ResourceSave";
import type {
  ResourceFavoriteInResource,
  ResourceInResource,
  ResourcePublicationInResource,
  ResourceTags,
  ResourceType,
} from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { MAX_REQUEST_SIZE } from "#shared/services/app/constants";
import { checkIsUuidV7 } from "#shared/services/id/checkIsUuidV7";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { MAX_RESOURCE_CONTENT_SIZE, STALE_CONTENT_VERSION_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ContentSyncEffectType } from "#src/models/resource/contentSync/ContentSyncEffect";
import { ContentSyncEventType } from "#src/models/resource/contentSync/ContentSyncEvent";
import { ContentSyncKind } from "#src/models/resource/contentSync/ContentSyncKind";
import { ResourceSaveState } from "#src/models/resource/ResourceSaveState";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { getFileSize } from "#src/services/file/getFileSize";
import { GO_TO_RESOURCE_TITLE, RESTORE_ACTION_TITLE } from "#src/services/resource/constants";
import { reduceContentSync } from "#src/services/resource/contentSync/reduceContentSync";
import { copyLinkToClipboard } from "#src/services/resource/copyLinkToClipboard";
import { favoriteTable, publicationTable, resourceTable } from "#src/services/resource/overlay/constants";
import { getDeleteResourcesEntry } from "#src/services/resource/overlay/getDeleteResourcesEntry";
import { getHeldResource } from "#src/services/resource/overlay/getHeldResource";
import { getPublicationPatchEntry } from "#src/services/resource/overlay/getPublicationPatchEntry";
import { getSaveResourceEntry } from "#src/services/resource/overlay/getSaveResourceEntry";
import { readStoredResourceContent } from "#src/services/resource/readStoredResourceContent";
import { ResourceContentHookMap } from "#src/services/resource/ResourceContentHookMap";
import { saveResourceContentDelta } from "#src/services/resource/saveResourceContentDelta";
import { saveStagedResourceContent } from "#src/services/resource/saveStagedResourceContent";
import { getSha256Hex } from "#src/services/shared/getSha256Hex";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { rethrowFailedRead } from "#src/services/shared/rethrowFailedRead";
import { trackPending } from "#src/services/shared/trackPending";
import { getRequestBodyByteLength } from "#src/services/trpc/getRequestBodyByteLength";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { getRouteParam } from "#src/util/router/getRouteParam";
import { NotificationSeverity } from "@esposter/db-schema";
import { exhaustiveGuard, getSynchronizedFunction, RoutePath, toRawDeep, withFinalizerAsync } from "@esposter/shared";

// One opening's content sync machine, and the resource its first read bound it to
interface ContentSync {
  opening: symbol;
  resourceId: string;
  state: ContentSyncState;
}

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
  const resourceWrite = useResourceWrite();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, dismissNotification } = notificationStore;
  const getResourceRouter = useResourceRouter();
  const { currentRoute } = useRouter();
  // Leaving the deleted resource is fire-and-forget: the blade moves on at once and nothing waits for the route to
  // Settle
  const navigateToExplorer = getSynchronizedFunction(async () => {
    await navigateTo(RoutePath.ResourceExplorerAll);
  });
  // The open resource is its id. Its row and its publication are held on the overlay, so the blade keeps no copy of
  // Either
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
  // Everything it applies — an optimistic value, the server's row — lands only while that resource is still the
  // Loaded one.
  // Applied to another, it would carry the first resource's fields into the second
  const checkIsLoaded = (id: string) => currentResourceId.value === id;
  // The publication and duplicate writes in flight, counted, since the page's buttons are disabled while one is out
  const pendingPublicationCount = ref(0);
  const isPublicationPending = computed(() => pendingPublicationCount.value > 0);
  const pendingDuplicateCount = ref(0);
  const isDuplicatePending = computed(() => pendingDuplicateCount.value > 0);

  // Which opening of the resource the state belongs to. Closing a resource and reopening it loads the same id,
  // So an id cannot tell a content read or a save the first opening issued from one of the reopened blade's —
  // Landed on the reopened one, it would hand that blade content older than the row it just read, and its next
  // Save would write that content under the fresh contentVersion. A refresh of the open resource is the same
  // Opening: its in-flight writes are still the ones on screen
  let opening = Symbol("opening");
  // A late result is for the opening it was issued under, so the check it captures holds only while that opening is
  // Still open
  const captureOpeningCheck = () => {
    const issuedUnder = opening;
    return () => opening === issuedUnder;
  };
  // A restore re-reads within the one opening, so the opening alone cannot drop a read issued before the restore that
  // Lands after it: the scope aborts a read a newer one replaces, so only the newest read's content applies
  const { executeQuery: executeContentQuery } = useMutation();
  const contentReadRunScope = useRunScope();
  const contentReadKey = Symbol("readContent");
  // The stored bytes this client holds — read straight from R2, or sent by a save whose hash the server
  // Confirmed — which is what a large document's next save is compressed against. Not reactive and not persisted:
  // Nothing renders it, and a reload reads the bytes afresh
  let contentBaseline: ContentBaseline | undefined;

  // Where the open content stands with the server, as one state of the content sync machine. Every rule about which
  // Save goes, which row is another writer's and when content may replace an edit is the reducer's; this store only
  // Runs the effects it asks for (openspec/specs/architecture/content-sync/design.md)
  const contentSync = shallowRef<ContentSync>({ opening, resourceId: "", state: { kind: ContentSyncKind.Unread } });
  // Openings closed while a save of theirs was in flight: the save, and the latest one asked for behind it, still land
  // Under the version that opening confirmed, and the machine is dropped once it settles
  const closingContentSyncs = new Map<symbol, ContentSync>();
  // Each resource's saves still in flight, across its openings, with the settlement a caller waits on
  const contentSaves = new Map<string, PromiseWithResolvers<void>>();
  const checkIsSaving = (id: string) =>
    [contentSync.value, ...closingContentSyncs.values()].some(
      ({ resourceId: syncResourceId, state }) => syncResourceId === id && state.kind === ContentSyncKind.Saving,
    );
  const whenContentSaved = (id: string) => contentSaves.get(id)?.promise ?? Promise.resolve();
  const findContentSync = (syncOpening: symbol) =>
    contentSync.value.opening === syncOpening ? contentSync.value : closingContentSyncs.get(syncOpening);
  const storeContentSync = (newContentSync: ContentSync) => {
    if (contentSync.value.opening === newContentSync.opening) contentSync.value = newContentSync;
    else if (newContentSync.state.kind === ContentSyncKind.Saving)
      closingContentSyncs.set(newContentSync.opening, newContentSync);
    else closingContentSyncs.delete(newContentSync.opening);

    const { resourceId: syncResourceId } = newContentSync;
    if (checkIsSaving(syncResourceId)) {
      if (!contentSaves.has(syncResourceId)) contentSaves.set(syncResourceId, Promise.withResolvers<void>());
    } else {
      contentSaves.get(syncResourceId)?.resolve();
      contentSaves.delete(syncResourceId);
    }
  };
  // One event through the reducer for the opening it belongs to. An event for an opening already gone is dropped, and
  // The effects are returned for the caller to run, so a read can apply its content before the rest follows
  const reduceOpening = (syncOpening: symbol, event: ContentSyncEvent): ContentSyncEffect[] => {
    const target = findContentSync(syncOpening);
    if (!target) return [];

    const { effects, state } = reduceContentSync(target.state, event);
    storeContentSync({ ...target, state });
    return effects;
  };
  const runContentSyncEffect = async (syncOpening: symbol, effect: ContentSyncEffect) => {
    switch (effect.type) {
      // A read applies its own content before its effects reach here
      case ContentSyncEffectType.ApplyRead:
        return;
      case ContentSyncEffectType.ReadContent:
        await adoptContent();
        return;
      case ContentSyncEffectType.ReadRow:
        await readOpenResource(executeReloadQuery, {
          isUnwatched: true,
          key: reloadKey,
          onRead: applyResource,
          runScope: reloadRunScope,
        });
        return;
      case ContentSyncEffectType.RequestSave:
        if (resource.value) await ResourceContentHookMap.Keep.run(resource.value.type);
        return;
      case ContentSyncEffectType.Send:
        sendContent(syncOpening, effect.snapshot, effect.version);
        return;
      default:
        exhaustiveGuard(effect);
    }
  };
  // An opening the blade has moved on from has no screen to read into or ask for content, so only its sends still run
  const runContentSyncEffects = async (syncOpening: symbol, effects: ContentSyncEffect[]) => {
    const runnableEffects =
      syncOpening === contentSync.value.opening
        ? effects
        : effects.filter(({ type }) => type === ContentSyncEffectType.Send);
    // oxlint-disable-next-line no-await-in-loop -- Order is the contract: an effect acts on what the one before it left
    for (const effect of runnableEffects) await runContentSyncEffect(syncOpening, effect);
  };
  const runContentSyncEffectsInBackground = getSynchronizedFunction(runContentSyncEffects);
  const dispatchContentSync = (event: ContentSyncEvent, syncOpening = contentSync.value.opening) => {
    runContentSyncEffectsInBackground(syncOpening, reduceOpening(syncOpening, event));
  };
  // A new opening takes its own identity and an unread machine, so nothing the one before it issued reaches it. A save
  // The old opening still has in flight keeps its machine until it settles
  const startOpening = () => {
    if (contentSync.value.state.kind === ContentSyncKind.Saving)
      closingContentSyncs.set(contentSync.value.opening, contentSync.value);
    opening = Symbol("opening");
    contentSync.value = { opening, resourceId: "", state: { kind: ContentSyncKind.Unread } };
  };
  const checkIsContentRead = () =>
    contentSync.value.state.kind !== ContentSyncKind.Unread && contentSync.value.resourceId === resource.value?.id;
  // Every type's edits land through saveContent, so the state every type shows is derived here rather than declared per
  // Type (openspec/specs/resource/resource-save-state/design.md). Only the opening on screen is read, so a save of a
  // Resource the blade has moved on from never shows as this one's
  const saveState = computed(() => {
    const { resourceId: syncResourceId, state } = contentSync.value;
    if (syncResourceId !== currentResourceId.value) return ResourceSaveState.Saved;

    switch (state.kind) {
      case ContentSyncKind.Conflict:
        return ResourceSaveState.Stale;
      case ContentSyncKind.Adopting:
      case ContentSyncKind.Dirty:
      case ContentSyncKind.Saving:
        return ResourceSaveState.Saving;
      case ContentSyncKind.Failed:
        return ResourceSaveState.Failed;
      case ContentSyncKind.Synced:
      case ContentSyncKind.Unread:
        return ResourceSaveState.Saved;
      default:
        return exhaustiveGuard(state);
    }
  });
  // Another writer's save that meets an unsaved edit: what the notice shows and answers
  const heldSave = computed<ResourceSave | undefined>(() => {
    const { state } = contentSync.value;
    return state.kind === ContentSyncKind.Conflict ? { contentVersion: state.remoteVersion } : undefined;
  });
  // The block a row lands in, whichever read fetched it. A row that is not the one open starts a new opening
  const assignResource = (
    newResource: ResourceInResource,
    newFavorite: null | ResourceFavoriteInResource,
    newPublication: null | ResourcePublicationInResource,
  ) => {
    if (!checkIsLoaded(newResource.id)) startOpening();
    resourceId.value = newResource.id;
    arrive(resourceTable, newResource);
    if (newPublication) arrive(publicationTable, newPublication);
    if (newFavorite) arrive(favoriteTable, newFavorite);
  };

  // The open resource's read, issued through the executor its caller holds. The route names what to read, and a route
  // With no resource segment names nothing, since the empty sentinel would reach the server as a uuid that
  // Fails validation. The answer applies only while the route still names that resource: reads for two resources are
  // Not one target, so a navigation away can let the earlier one land last. The executor is the caller's, because a
  // Read's topic watch ends with the scope of the useMutation() instance that issued it, so the page's watched read
  // Ends with the page and the store's read holds none
  const readOpenResource = async (
    executeRead: ReturnType<typeof useMutation>["executeQuery"],
    {
      isUnwatched,
      key,
      onError,
      onRead,
      runScope,
    }: {
      isUnwatched?: true | undefined;
      key: PropertyKey;
      onError?: ((error: Error) => Promisable<void>) | undefined;
      onRead: (
        newResource: ResourceInResource,
        newFavorite: null | ResourceFavoriteInResource,
        newPublication: null | ResourcePublicationInResource,
      ) => void;
      runScope: ReturnType<typeof useRunScope>;
    },
  ) => {
    const id = getRouteParam(currentRoute.value.params, "id");
    if (!checkIsUuidV7(id)) return;

    await rethrowFailedRead(
      executeRead(() => $trpc.resource.readResource.query({ id }), {
        isUnwatched,
        key,
        onError,
        onSuccess: ({ favorite: newFavorite, publication: newPublication, ...newResource }) => {
          if (getRouteParam(currentRoute.value.params, "id") !== id) return;

          onRead(newResource, newFavorite, newPublication);
        },
        runScope,
      }),
    );
  };
  // A content reload follows a re-read of the row, so the row it takes is the version the reloaded content is read at.
  // Tracked on its own executor so the page's Refresh shows the read in flight, and one key so repeated clicks queue
  // Rather than overlap
  const { executeQuery: executeReloadQuery, isPending: isReloadPending } = useMutation();
  const reloadRunScope = useRunScope();
  const reloadKey = Symbol("reloadResource");
  const reloadResource = () =>
    readOpenResource(executeReloadQuery, {
      // The store outlives the page, and the page's own read keeps the open row live, so this one-shot read holds no
      // Watch
      isUnwatched: true,
      key: reloadKey,
      onRead: assignResource,
      runScope: reloadRunScope,
    });
  // The page that opened this resource takes its state back down when it closes. A keyed page swap mounts the
  // Next resource's page before this one unmounts, so the teardown fires only while the state is still the one
  // The caller loaded — otherwise closing A would blank the B the swap has already loaded
  const clearResource = (id: string) => {
    if (resourceId.value && resourceId.value !== id) return;

    resourceId.value = "";
    startOpening();
    contentBaseline = undefined;
  };

  // The content the machine asked for is read: the row first, then each content store re-reads through the hook
  // Registry, and an editor holding its own copy adopts it only when the read applied. The stages are sequential
  // Because each reads what the one before it landed
  // (openspec/specs/architecture/third-party-document-adapters/design.md)
  const adoptContent = async () => {
    await reloadResource();
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const appliedBefore = appliedReadCount;
    await ResourceContentHookMap.Reload.run(resourceValue.type);
    // The bytes the client held name the document the read replaced, so the next large save crosses whole
    contentBaseline = undefined;
    if (appliedReadCount === appliedBefore) return;

    await ResourceContentHookMap.Adopt.run(resourceValue.type);
  };
  // This resource's content was replaced underneath whatever blade is open — a restore is the one write that does that
  const reloadResourceContent = () => {
    const syncOpening = contentSync.value.opening;
    return runContentSyncEffects(
      syncOpening,
      reduceOpening(syncOpening, { type: ContentSyncEventType.ReloadRequested }),
    );
  };
  // Counted so an adoption can tell whether its read applied, without a flag that outlives it
  let appliedReadCount = 0;
  // The blob is written on first save, so a freshly created resource returns undefined content.
  // The dispatch reads the loaded row's own type, so the procedure resolves to the union of every type's
  // Content read — narrowing it to TType is the calling content store's claim about which resources it opens,
  // Which is the same claim the blade route guard enforces.
  // The content reaches the caller only when the machine takes the read: an opening that has none yet, or one adopting
  // Another writer's save with no edit made since
  const readContent = async <TType extends ResourceType = ResourceType>(
    applyContent: (content: ResourceContent<TType> | undefined) => void,
  ) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { contentHash, contentSize, contentVersion, id, type } = resourceValue;
    const readOpening = opening;
    const resourceRouter = getResourceRouter(type);
    // A read crosses the way a save of the same document would: through the server while one body carries it,
    // Straight from R2 above that (openspec/specs/architecture/large-documents/design.md). The stored bytes are then
    // The delta baseline as well, so a session's first large save can already be a delta
    await rethrowFailedRead(
      executeContentQuery(
        async () => {
          if (contentSize < MAX_REQUEST_SIZE)
            return { content: await resourceRouter.readResourceContent.query({ id }) };

          const bytes = await readStoredResourceContent(resourceRouter, id);
          const storedContent: ContentBaseline = { bytes, hash: await getSha256Hex(bytes), id };
          const serializedContent = new TextDecoder().decode(bytes);
          /* oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, so free-text
             ISO strings survive */
          const content: unknown = ResourceDefinitionMap[type].contentSchema.parse(JSON.parse(serializedContent));
          return { content, storedContent };
        },
        {
          key: contentReadKey,
          onSuccess: ({ content, storedContent }) => {
            const target = findContentSync(readOpening);
            if (opening !== readOpening || !target) return;
            // The read is for this resource: an opening's machine is bound to the resource its first read was for
            if (target.state.kind === ContentSyncKind.Unread) storeContentSync({ ...target, resourceId: id });
            // The hash is the row's as it was before the blob was read, so a save that lands during the read leaves the
            // Hash behind the content, and the next refetch of the row reads it again rather than missing it
            const effects = reduceOpening(readOpening, {
              hash: contentHash,
              type: ContentSyncEventType.Read,
              version: contentVersion,
            });
            if (!effects.some(({ type: effectType }) => effectType === ContentSyncEffectType.ApplyRead)) return;

            appliedReadCount++;
            if (storedContent) contentBaseline = storedContent;
            /* oxlint-disable typescript/no-unsafe-type-assertion -- the content read is the resource type TType the
               caller names, which the store's runtime type cannot carry to the compiler; the union of every type's
               content write takes the one argument each arm accepts, so the input is named as never where it is
               saved */
            applyContent(content as ResourceContent<TType> | undefined);
            // oxlint-enable typescript/no-unsafe-type-assertion
            runContentSyncEffectsInBackground(readOpening, effects);
          },
          runScope: contentReadRunScope,
        },
      ),
    );
  };
  // Every content store calls this once its load has hydrated: the first save of a session is then compared with what
  // Was just read, so the editor's own load echo writes nothing and bumps no version other clients would see as stale
  const setPersistedContent = (content: ResourceContent<ResourceType>) => {
    dispatchContentSync({ json: JSON.stringify(content), type: ContentSyncEventType.Seeded });
  };
  // An edit seen by autosave, before its debounce asks for the save
  const markContentEdited = (id: string) => {
    if (contentSync.value.resourceId === id) dispatchContentSync({ type: ContentSyncEventType.Edited });
  };
  // The page's read of the open row lands here. A read of the resource already open is a refresh: its row and
  // Publication arrive as any other row does, and the machine decides whether its content is another writer's
  const applyResource = (
    newResource: ResourceInResource,
    newFavorite: null | ResourceFavoriteInResource,
    newPublication: null | ResourcePublicationInResource,
  ) => {
    if (!checkIsLoaded(newResource.id)) {
      assignResource(newResource, newFavorite, newPublication);
      return;
    }

    arrive(resourceTable, newResource);
    if (newPublication) arrive(publicationTable, newPublication);
    if (newFavorite) arrive(favoriteTable, newFavorite);
    if (contentSync.value.resourceId === newResource.id)
      dispatchContentSync({
        hash: newResource.contentHash,
        type: ContentSyncEventType.RowArrived,
        version: newResource.contentVersion,
      });
  };
  // Taking theirs: the other version is adopted and the unsaved edit is dropped with the content it was an edit of
  const takeOtherSave = () => {
    const syncOpening = contentSync.value.opening;
    return runContentSyncEffects(syncOpening, reduceOpening(syncOpening, { type: ContentSyncEventType.TheirsTaken }));
  };
  // Keeping mine: the local document is written over the other version as the newest, which stays in history
  const keepUnwrittenContent = () => {
    const syncOpening = contentSync.value.opening;
    return runContentSyncEffects(syncOpening, reduceOpening(syncOpening, { type: ContentSyncEventType.MineKept }));
  };
  // The content is already on screen, so the save gives its caller nothing to await. Only content read for this
  // Resource is written: a debounced autosave can fire after a read swapped in another resource but before the content
  // Store re-seeded its ref, and the machine of a new opening is Unread until its own read lands
  const saveContent = (content: ResourceContent<ResourceType>) => {
    const resourceValue = resource.value;
    if (!resourceValue || !checkIsContentRead()) return;

    const json = JSON.stringify(content);
    const bytes = new TextEncoder().encode(json);
    // The serialization already made is what sizes the document, so a document no resource may hold is refused here
    // Rather than sent — the server would refuse it after the whole upload
    if (bytes.byteLength > MAX_RESOURCE_CONTENT_SIZE) {
      dispatchContentSync({ type: ContentSyncEventType.SaveRefused });
      createNotification({
        severity: NotificationSeverity.Error,
        title: `"${resourceValue.name}" is ${getFileSize(bytes.byteLength)}, over the ${getFileSize(MAX_RESOURCE_CONTENT_SIZE)} a resource can hold — it was not saved`,
      });
      return;
    }
    // A body under the request limit sends the content object as it was when the save was asked for, not as it stands
    // When the save goes out behind another
    const snapshotContent = bytes.byteLength < MAX_REQUEST_SIZE ? structuredClone(toRawDeep(content)) : undefined;
    dispatchContentSync({ snapshot: { content: snapshotContent, json }, type: ContentSyncEventType.SaveRequested });
  };
  // The one write the machine asks for. Its answer, or its refusal, is the machine's to judge
  const sendContent = (syncOpening: symbol, snapshot: ContentSnapshot, contentVersion: number) => {
    const target = findContentSync(syncOpening);
    const resourceValue = target ? getHeldResource(resourceRows.value, target.resourceId) : undefined;
    if (!target || !resourceValue) return;

    const { id, type } = resourceValue;
    const resourceRouter = getResourceRouter(type);
    const contentBytes = new TextEncoder().encode(snapshot.json);
    writeOptimistic(
      async () => {
        const sent = { contentVersion, id };
        const input = { content: snapshot.content, ...sent };
        const baseline = contentBaseline?.id === id ? contentBaseline : undefined;
        // A body the server's request size limiter would refuse goes as a delta against the stored bytes when this
        // Client holds them, and staged through R2 otherwise. The body is measured as the transformer
        // Writes it, never as the content's own JSON, which is smaller — but only once the JSON alone is under the
        // Limit, since the body is never smaller than it
        const savedResource =
          contentBytes.byteLength >= MAX_REQUEST_SIZE || getRequestBodyByteLength(input) >= MAX_REQUEST_SIZE
            ? ((baseline && (await saveResourceContentDelta(resourceRouter, contentBytes, baseline, sent))) ??
              (await saveStagedResourceContent(resourceRouter, contentBytes, sent)))
            : /* oxlint-disable typescript/no-unsafe-type-assertion -- the content read is the resource type TType the
                 caller names, which the store's runtime type cannot carry to the compiler; the union of every type's
                 content write takes the one argument each arm accepts, so the input is named as never where it is
                 saved */
              await resourceRouter.saveResourceContent.mutate(input as never);
        // oxlint-enable typescript/no-unsafe-type-assertion
        // The server stores its own serialization of the parsed document, which a content schema's transforms can
        // Make differ from what was sent, so the sent bytes become the baseline only when their hash is the one stored
        const contentHash = await getSha256Hex(contentBytes);
        contentBaseline =
          savedResource.contentHash === contentHash ? { bytes: contentBytes, hash: contentHash, id } : undefined;
        dispatchContentSync(
          {
            hash: savedResource.contentHash,
            type: ContentSyncEventType.SaveAcknowledged,
            version: savedResource.contentVersion,
          },
          syncOpening,
        );
        return createRowResponse(resourceTable, savedResource);
      },
      {
        // A content save shows no change, so its entry only reads the rows its answer names
        entry: getSaveResourceEntry(id, userId.value),
        onError: (error) => {
          const isStale = error.message === STALE_CONTENT_VERSION_ERROR_MESSAGE;
          // A stale refusal is another writer's save, which the notice offers as a choice while the resource is
          // Open. One the blade has moved on from has no notice to show it, so the edit it did not save is told instead
          if (!isStale) createErrorNotification(error);
          else if (contentSync.value.opening !== syncOpening)
            createNotification({
              severity: NotificationSeverity.Warning,
              title: `"${resourceValue.name}" was modified elsewhere, so your last edit to it was not saved`,
            });
          dispatchContentSync({ isStale, type: ContentSyncEventType.SaveRejected }, syncOpening);
        },
      },
    );
  };
  // An editor's own check refused the save before it reached saveContent, so no write was issued and the state reads
  // Not saved
  const refuseSaveContent = () => {
    dispatchContentSync({ type: ContentSyncEventType.SaveRefused });
  };
  const renameResource = (name: string) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    resourceWrite.updateResource(resourceValue, { name });
  };
  // Whole-record replace, which is Azure's own tag update semantics — the dialog always sends every tag. Only the tags
  // Are sent, so an edit queued behind a rename never puts back the name the rename replaced
  const updateResourceTags = (tags: ResourceTags) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    resourceWrite.updateResource(resourceValue, { tags });
  };
  const deleteResource = () => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { id, type } = resourceValue;
    // The blade leaves the deleted resource at once, since every action it would send after this is refused
    navigateToExplorer();
    resourceWrite.writeOptimistic(
      async () => createRowResponse(resourceTable, await getResourceRouter(type).deleteResource.mutate({ id })),
      {
        entry: getDeleteResourcesEntry([id], new Date()),
        // The same undo the list's delete leaves, spent once the restore lands. A refused delete never removed the
        // Resource, so the write withdraws this notice with its Restore
        notification: {
          action: {
            handler: () => {
              restoreResources([resourceValue]);
            },
            isSingleUse: true,
            title: RESTORE_ACTION_TITLE,
          },
          severity: NotificationSeverity.Success,
          title: ResourceOperationTitleMap[ResourceOperationType.Deleted](resourceValue.name, 1),
        },
      },
    );
  };
  const duplicateResource = async () => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    await trackPending(pendingDuplicateCount, () =>
      resourceWrite.writeAwaited(
        async () => {
          const newResource = await $trpc.resource.duplicateResource.mutate({ id: resourceValue.id });
          createNotification({
            action: { title: GO_TO_RESOURCE_TITLE, to: RoutePath.Resource(newResource.id) },
            severity: NotificationSeverity.Success,
            title: ResourceOperationTitleMap[ResourceOperationType.Duplicated](newResource.name),
          });
          // The page opens the copy by the id the server gives it
          await navigateTo(RoutePath.Resource(newResource.id));
          return [createArrival(resourceTable, newResource)];
        },
        { awaitedBecause: AwaitedReason.ServerIssuedValue },
      ),
    );
  };
  const publishResource = () => {
    const resourceValue = resource.value;
    if (!resourceValue || !checkHasCapability(resourceValue.type, "publishable")) return;

    const { id, name, type } = resourceValue;
    const resourceRouter = getResourceRouter(type);
    // Nothing is drawn ahead of the answer: the publication is the server's, so it arrives with its version
    getSynchronizedFunction(() =>
      trackPending(pendingPublicationCount, () =>
        writeAwaited(
          async () => {
            const newPublication = await resourceRouter.publishResource.mutate({ id });
            createNotification({
              action: { handler: () => copyLinkToClipboard(RoutePath.View(type, id)), title: "Copy public link" },
              severity: NotificationSeverity.Success,
              title: ResourceOperationTitleMap[ResourceOperationType.Published](name, newPublication.publishVersion),
            });
            return [createArrival(publicationTable, newPublication)];
          },
          { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorNotification },
        ),
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
            // An unpublish that removed nothing answers no row, so its entry is confirmed at once with nothing to
            // Arrive
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
    captureOpeningCheck,
    checkIsContentRead,
    clearResource,
    currentResourceId,
    deleteResource,
    duplicateResource,
    heldSave,
    isDuplicatePending,
    isPublicationPending,
    isReloadPending,
    keepUnwrittenContent,
    markContentEdited,
    publication,
    publishResource,
    readContent,
    readOpenResource,
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
    updateResourceTags,
    whenContentSaved,
  };
});
