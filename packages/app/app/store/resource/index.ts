import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { Resource, ResourcePublication, ResourceTags, ResourceType } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { staleContentVersionErrorMessage } from "#shared/services/resource/constants";
import { hasCapability } from "#shared/services/resource/hasCapability";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { ResourceContentHookMap } from "@/services/resource/ResourceContentHookMap";
import { useNotificationStore } from "@/store/notification";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { NotificationSeverity } from "@esposter/db-schema";
import { checkIsUuidV4, RoutePath, withFinalizerAsync } from "@esposter/shared";

// The resource the blade has open — its row, its publication and the bookkeeping its content saves need.
// One resource is open at a time, so the page shell, the toolbar and whichever content store the type's editor
// Drives all read the same state here instead of the page threading it down through every component between
// Them. Blade-scoped: the store is app-lifetime, this state is not, so the page clears it on unmount
export const useResourceStore = defineStore("resource", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeSaveContentMutation } = useMutation();
  const { executeMutation: executeRenameMutation } = useMutation();
  const { executeMutation: executeUpdateTagsMutation } = useMutation();
  const { executeMutation: executeDeleteMutation } = useMutation();
  const { executeMutation: executeDuplicateMutation, isPending: isDuplicatePending } = useMutation();
  // Publishing and unpublishing are the two writes that end the same publication row, so they share one
  // Executor rather than each holding its own: on separate instances one key promises an ordering that never
  // Existed, and an unpublish overlapping a publish rolls back to the publication the publish had not created
  // Yet — leaving a resource the server has published showing as a draft
  const { executeMutation: executePublicationMutation, isPending: isPublicationPending } = useMutation();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const getResourceRouter = useResourceRouter();
  const { currentRoute } = useRouter();
  const resource = ref<Resource>();
  const publication = ref<ResourcePublication>();
  const isPending = ref(false);
  // Every write reconciles only the fields it owns. By the time a rollback or a server row lands the ref may
  // Have absorbed another concurrent edit — an autosave's contentVersion, a rename, a tag edit — so replacing
  // It wholesale would clobber that edit; the fallback covers a ref that holds nothing to merge into
  const mergeResource = (fields: Partial<Resource>, fallback: Resource) => {
    resource.value = resource.value ? { ...resource.value, ...fields } : fallback;
  };
  // The resource the in-memory content belongs to. A content store fills its own ref from readContent, so that
  // Read is the moment the content in hand becomes this resource's — and it stays the previous resource's for
  // The whole of readResource() plus the await that follows it
  let contentResourceId: string | undefined;
  // The last content shape known to be persisted — saveContent() skips the write when nothing changed, so a
  // Load-echoed autosave or an unedited explicit save never bumps contentVersion over the wire.
  // Content stores seed it after hydrating so the first debounced watch tick has something to compare against
  let persistedContentJson: string | undefined;
  // A stale contentVersion can only be cured by reloading, so once the server rejects a save every
  // Retry is a guaranteed rejection — the flag turns saveContent() into a no-op (and the warning into a
  // One-shot) until the next readResource() reads a fresh version
  let isContentStale = false;
  const readResource = async () => {
    // Resolved per call rather than captured: the store outlives the page, so the loader always reads whichever
    // Resource the route names now
    const id = getRouteParamString(currentRoute.value.params.id);
    // A route with no resource segment — a list view, or one this read raced a navigation to — names nothing to
    // Read, and the empty sentinel would reach the server as a uuid that fails validation
    if (!checkIsUuidV4(id)) return;

    isPending.value = true;
    await withFinalizerAsync(
      async () => {
        // The publication rides the resource read rather than following it: a second round trip only re-resolved
        // The ownership this one already did. `null` is the read's answer for a resource that has none — an
        // Unpublished one, or a type that cannot publish at all — where `undefined` here still means unread
        const { publication: newPublication, ...newResource } = await $trpc.resource.readResource.query({ id });
        resource.value = newResource;
        publication.value = newPublication ?? undefined;
        // A fresh read carries the current contentVersion, so saving is meaningful again
        isContentStale = false;
      },
      () => {
        isPending.value = false;
      },
    );
  };
  // The page that opened this resource takes its state back down when it closes. A keyed page swap mounts the
  // Next resource's page before this one unmounts, so the teardown fires only while the state is still the one
  // The caller loaded — otherwise closing A would blank the B the swap has already loaded
  const clearResource = (id: string) => {
    if (resource.value && resource.value.id !== id) return;

    resource.value = undefined;
    publication.value = undefined;
    contentResourceId = undefined;
    persistedContentJson = undefined;
    isContentStale = false;
  };
  // This resource's content was replaced underneath whatever blade is open — a restore is the one write that
  // Does that. The row is re-read here and the content stores re-read themselves through the hook registry,
  // Rather than the blade being keyed on a counter something bumps: which store holds the content is the
  // Type's business, and a blade left holding the pre-restore draft has its own next save rejected as stale
  const reloadResourceContent = async () => {
    await readResource();
    if (resource.value) await ResourceContentHookMap.Reload.run(resource.value.type);
  };
  // The blob is written on first save, so a freshly created resource returns undefined content.
  // The dispatch reads the loaded row's own type, so the procedure resolves to the union of every type's
  // Content read — narrowing it to TType is the calling content store's claim about which resources it opens,
  // Which is the same claim the blade route guard enforces
  const readContent = async <TType extends ResourceType = ResourceType>() => {
    const current = resource.value;
    if (!current) return undefined;
    const content = await getResourceRouter(current.type).readResourceContent.query({ id: current.id });
    contentResourceId = current.id;
    return content as ResourceContent<TType> | undefined;
  };
  // Every content store calls this once its load has hydrated, and the two GrapesJS ones have to: the editor
  // Stores as soon as it finishes loading, so the first save of a session is an echo of what was just read.
  // Unseeded, that echo counts as a change — it bumps contentVersion for content nobody edited, and every
  // Other client holding the page open is then told its version is stale
  const setPersistedContent = (content: ResourceContent<ResourceType>) => {
    persistedContentJson = JSON.stringify(content);
  };
  // Another device saved this resource's content — adopting its contentVersion is what keeps this client's own
  // Next save from being rejected as stale
  const storeContentVersion = (contentVersion: Resource["contentVersion"]) => {
    if (resource.value) resource.value.contentVersion = contentVersion;
  };
  const saveContent = async (content: ResourceContent<ResourceType>) => {
    const current = resource.value;
    // A debounced autosave can fire after readResource() swapped in another resource but before the content
    // Store has re-seeded its content ref, and the content in hand is then still the previous resource's —
    // Writing it would replace this resource's document with another one's, under this one's id and version
    if (!current || isContentStale || (contentResourceId !== undefined && contentResourceId !== current.id))
      return false;
    const contentJson = JSON.stringify(content);
    if (contentJson === persistedContentJson) return true;
    let isSuccessful = false;
    await executeSaveContentMutation(
      () => {
        // Read when the write is sent rather than when it was issued: a save that queued behind another must
        // Carry the contentVersion that one wrote back, or the server rejects our own overlapping saves as a
        // Cross-session edit. A load that swapped the resource in between leaves the issue-time row in place
        const latest = resource.value;
        const target = latest?.id === current.id ? latest : current;
        // Calling the union of every type's content write needs an argument every arm accepts, so the
        // Content is narrowed the same way the read above widens it
        return getResourceRouter(target.type).saveResourceContent.mutate({
          content,
          contentVersion: target.contentVersion,
          id: target.id,
        } as never);
      },
      {
        // Content saves of one resource share its id, so they queue instead of overlapping
        key: current.id,
        onError: (error) => {
          if (error.message === staleContentVersionErrorMessage) {
            isContentStale = true;
            createNotification({
              action: {
                // A hard reload is the one path guaranteed to re-run every blade's content loader
                handler: () => {
                  reloadNuxtApp({ force: true });
                },
                title: "Refresh",
              },
              severity: NotificationSeverity.Warning,
              title: `"${current.name}" was modified elsewhere — refresh to load the latest`,
            });
          } else createErrorNotification(error);
        },
        onSuccess: (newResource) => {
          mergeResource({ contentVersion: newResource.contentVersion, updatedAt: newResource.updatedAt }, newResource);
          persistedContentJson = contentJson;
          isSuccessful = true;
        },
      },
    );
    return isSuccessful;
  };
  const renameResource = async (name: string) => {
    const current = resource.value;
    if (!current) return;
    await executeRenameMutation(() => getResourceRouter(current.type).updateResource.mutate({ id: current.id, name }), {
      // Read when the write is sent rather than when it was issued: renames of one resource queue, so a
      // Rejection has to restore the name the rename ahead of it stored, not the one on screen at issue time.
      // Merged rather than replaced for the same reason every other write here merges — the issue-time row has
      // No contentVersion an autosave bumped meanwhile, and no tags a tag edit wrote
      applyOptimistic: () => {
        const previous = resource.value ?? current;
        mergeResource({ name }, { ...previous, name });
        return () => {
          mergeResource({ name: previous.name }, previous);
        };
      },
      key: current.id,
      onError: createErrorNotification,
      onSuccess: (newResource) => {
        mergeResource({ name: newResource.name, updatedAt: newResource.updatedAt }, newResource);
      },
    });
  };
  // Whole-record replace, which is Azure's own tag update semantics — the dialog always sends every tag
  const updateResourceTags = async (tags: ResourceTags) => {
    const current = resource.value;
    if (!current) return;
    // A tag edit keeps its own executor rather than queueing behind a rename because the two own disjoint
    // Fields — which is only true if the write carries nothing but the tags. Sending the name alongside them
    // Would make a tag edit that overlaps a rename put the pre-rename name back on the server
    await executeUpdateTagsMutation(
      () => getResourceRouter(current.type).updateResource.mutate({ id: current.id, tags }),
      {
        // Same as the rename above: the row is read when the write is sent and only the tags are merged, so a
        // Rejection restores the tags the tag edit ahead of it stored and no other field is dragged back with them
        applyOptimistic: () => {
          const previous = resource.value ?? current;
          mergeResource({ tags }, { ...previous, tags });
          return () => {
            mergeResource({ tags: previous.tags }, previous);
          };
        },
        key: current.id,
        onError: createErrorNotification,
        onSuccess: (newResource) => {
          mergeResource({ tags: newResource.tags, updatedAt: newResource.updatedAt }, newResource);
        },
      },
    );
  };
  const deleteResource = async () => {
    const current = resource.value;
    if (!current) return false;
    let isSuccessful = false;
    await executeDeleteMutation(() => getResourceRouter(current.type).deleteResource.mutate({ id: current.id }), {
      key: current.id,
      onError: createErrorNotification,
      onSuccess: () => {
        createNotification({
          severity: NotificationSeverity.Success,
          title: ResourceOperationTitleMap[ResourceOperationType.Deleted](current.name, 1),
        });
        isSuccessful = true;
      },
    });
    return isSuccessful;
  };
  const duplicateResource = async () => {
    const current = resource.value;
    if (!current) return;
    await executeDuplicateMutation(() => $trpc.resource.duplicateResource.mutate({ id: current.id }), {
      key: Symbol("duplicateResource"),
      onError: createErrorNotification,
      onSuccess: async (newResource) => {
        createNotification({
          action: { title: "Go to resource", to: RoutePath.Resource(newResource.id) },
          severity: NotificationSeverity.Success,
          title: ResourceOperationTitleMap[ResourceOperationType.Duplicated](newResource.name),
        });
        await navigateTo(RoutePath.Resource(newResource.id));
      },
    });
  };
  const publishResource = async () => {
    const current = resource.value;
    if (!current || !hasCapability(current.type, "publishable")) return;

    const resourceRouter = getResourceRouter(current.type);
    await executePublicationMutation(() => resourceRouter.publishResource.mutate({ id: current.id }), {
      key: current.id,
      onError: createErrorNotification,
      onSuccess: (newPublication) => {
        publication.value = newPublication;
        createNotification({
          action: {
            handler: () => copyLinkToClipboard(RoutePath.View(current.type, current.id)),
            title: "Copy public link",
          },
          severity: NotificationSeverity.Success,
          title: ResourceOperationTitleMap[ResourceOperationType.Published](
            current.name,
            newPublication.publishVersion,
          ),
        });
      },
    });
  };
  const unpublishResource = async () => {
    const current = resource.value;
    if (!current || !hasCapability(current.type, "publishable")) return;

    const resourceRouter = getResourceRouter(current.type);
    await executePublicationMutation(() => resourceRouter.unpublishResource.mutate({ id: current.id }), {
      // Read when the write is sent rather than when it was issued: a second unpublish queues behind the first
      // And finds nothing left to withdraw, so a rejection restores that — captured at click time it would put
      // The publication the first unpublish already removed back on screen, complete with its public link
      applyOptimistic: () => {
        const currentPublication = publication.value;
        publication.value = undefined;
        return () => {
          publication.value = currentPublication;
        };
      },
      key: current.id,
      onError: createErrorNotification,
      onSuccess: () => {
        createNotification({
          severity: NotificationSeverity.Success,
          title: ResourceOperationTitleMap[ResourceOperationType.Unpublished](current.name),
        });
      },
    });
  };
  return {
    clearResource,
    deleteResource,
    duplicateResource,
    isDuplicatePending,
    isPending,
    isPublicationPending,
    publication,
    publishResource,
    readContent,
    readResource,
    reloadResourceContent,
    renameResource,
    resource,
    saveContent,
    setPersistedContent,
    storeContentVersion,
    unpublishResource,
    updateResourceTags,
  };
});
