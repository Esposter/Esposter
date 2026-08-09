import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { Resource, ResourcePublication, ResourceTags, ResourceType } from "@esposter/db-schema";

import { staleContentVersionErrorMessage } from "#shared/services/resource/constants";
import { hasCapability } from "#shared/services/resource/hasCapability";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { useNotificationStore } from "@/store/notification";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

// Blade-scoped state for one resource (metadata + content + publication).
// A store that owns one type's content declares it as `useResource<ResourceType.Sheet>`, and its content is
// Typed as that type's own shape throughout — the metadata half is identical for every type, so the resource
// Page, which opens whatever the route names, declares nothing and simply leaves the content half alone
export const useResource = <TType extends ResourceType = ResourceType>(id: MaybeRefOrGetter<string>) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeSaveMutation } = useMutation();
  const { executeMutation: executeRenameMutation } = useMutation();
  const { executeMutation: executeUpdateTagsMutation } = useMutation();
  const { executeMutation: executeRemoveMutation } = useMutation();
  const { executeMutation: executeDuplicateMutation, isPending: isDuplicatePending } = useMutation();
  const { executeMutation: executePublishMutation, isPending: isPublishPending } = useMutation();
  const { executeMutation: executeUnpublishMutation, isPending: isUnpublishPending } = useMutation();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const getResourceRouter = useResourceRouter();
  const resource = ref<Resource>();
  const publication = ref<ResourcePublication>();
  const isLoading = ref(false);
  // Every write reconciles only the fields it owns. By the time a rollback or a server row lands the ref may
  // Have absorbed another concurrent edit — an autosave's contentVersion, a rename, a tag edit — so replacing
  // It wholesale would clobber that edit; the fallback covers a ref that holds nothing to merge into
  const mergeResource = (fields: Partial<Resource>, fallback: Resource) => {
    resource.value = resource.value ? { ...resource.value, ...fields } : fallback;
  };
  const load = async () => {
    // Resolved per call so a persisted store's loader always reads the current route id
    const idValue = toValue(id);
    isLoading.value = true;
    await withFinalizerAsync(
      async () => {
        resource.value = await $trpc.resource.readResource.query({ id: idValue });
        const { type } = resource.value;
        // Only a publishable type has a publication to read, and the capability is what makes the procedure
        // Reachable — so the guard and the availability are one fact rather than two that can disagree
        publication.value = hasCapability(type, "publishable")
          ? await getResourceRouter(type).readResourcePublication.query({ id: idValue })
          : undefined;
        // A fresh read carries the current contentVersion, so saving is meaningful again
        isContentStale = false;
      },
      () => {
        isLoading.value = false;
      },
    );
  };
  // The resource the caller's in-memory content belongs to. A store fills its content ref from readContent,
  // So that read is the moment the content in hand becomes this resource's — and it stays the previous
  // Resource's for the whole of `load()` plus the await that follows it
  let contentResourceId: string | undefined;
  // The blob is written on first save, so a freshly created resource returns undefined content.
  // The dispatch reads the loaded row's own type, so the procedure resolves to the union of every type's
  // Content read — narrowing it to TType is the caller's claim about which resources it opens, which is the
  // Same claim the blade route guard enforces. Made once here rather than restated at every call site
  const readContent = async () => {
    const current = resource.value;
    if (!current) return undefined;
    const content = await getResourceRouter(current.type).readResourceContent.query({ id: current.id });
    contentResourceId = current.id;
    return content as ResourceContent<TType> | undefined;
  };
  // The last content shape known to be persisted — save() skips the write when nothing changed, so a
  // Load-echoed autosave or an unedited explicit save never bumps contentVersion over the wire.
  // Stores seed it after hydrating so the first debounced watch tick has something to compare against
  let persistedContentJson: string | undefined;
  const setPersistedContent = (content: ResourceContent<TType>) => {
    persistedContentJson = JSON.stringify(content);
  };
  // A stale contentVersion can only be cured by reloading, so once the server rejects a save every
  // Retry is a guaranteed rejection — the flag turns save() into a no-op (and the warning into a
  // One-shot) until the next load() reads a fresh version
  let isContentStale = false;
  const save = async (content: ResourceContent<TType>) => {
    const current = resource.value;
    // A debounced autosave can fire after `load()` swapped in another resource but before the store has
    // Re-seeded its content ref, and the content in hand is then still the previous resource's — writing it
    // Would replace this resource's document with another one's, under this one's id and contentVersion
    if (!current || isContentStale || (contentResourceId !== undefined && contentResourceId !== current.id))
      return false;
    const contentJson = JSON.stringify(content);
    if (contentJson === persistedContentJson) return true;
    let isSuccessful = false;
    await executeSaveMutation(
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
              severity: "warning",
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
  const rename = async (name: string) => {
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
  const updateTags = async (tags: ResourceTags) => {
    const current = resource.value;
    if (!current) return;
    await executeUpdateTagsMutation(
      () => getResourceRouter(current.type).updateResource.mutate({ id: current.id, name: current.name, tags }),
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
  const remove = async () => {
    const current = resource.value;
    if (!current) return false;
    let isSuccessful = false;
    await executeRemoveMutation(() => getResourceRouter(current.type).deleteResource.mutate({ id: current.id }), {
      key: current.id,
      onError: createErrorNotification,
      onSuccess: () => {
        createNotification({ severity: "success", title: `Deleted "${current.name}"` });
        isSuccessful = true;
      },
    });
    return isSuccessful;
  };
  const duplicate = async () => {
    const current = resource.value;
    if (!current) return;
    await executeDuplicateMutation(() => $trpc.resource.duplicateResource.mutate({ id: current.id }), {
      // A duplicate produces a brand-new resource with no id yet, so each gets a per-call symbol
      key: Symbol("duplicateResource"),
      onError: createErrorNotification,
      onSuccess: async (newResource) => {
        createNotification({
          action: { title: "Go to resource", to: RoutePath.Resource(newResource.id) },
          severity: "success",
          title: `Created "${newResource.name}"`,
        });
        await navigateTo(RoutePath.Resource(newResource.id));
      },
    });
  };
  const publish = async () => {
    const current = resource.value;
    if (!current || !hasCapability(current.type, "publishable")) return;

    const { publishResource } = getResourceRouter(current.type);
    await executePublishMutation(() => publishResource.mutate({ id: current.id }), {
      key: current.id,
      onError: createErrorNotification,
      onSuccess: (newPublication) => {
        publication.value = newPublication;
        createNotification({
          action: {
            handler: () => copyLinkToClipboard(RoutePath.View(current.type, current.id)),
            title: "Copy public link",
          },
          severity: "success",
          title: `Published "${current.name}" (v${newPublication.publishVersion})`,
        });
      },
    });
  };
  const unpublish = async () => {
    const current = resource.value;
    if (!current || !hasCapability(current.type, "publishable")) return;

    const { unpublishResource } = getResourceRouter(current.type);
    await executeUnpublishMutation(() => unpublishResource.mutate({ id: current.id }), {
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
        createNotification({ severity: "success", title: `Unpublished "${current.name}"` });
      },
    });
  };
  return {
    duplicate,
    isDuplicatePending,
    isLoading,
    isPublishPending,
    isUnpublishPending,
    load,
    publication,
    publish,
    readContent,
    remove,
    rename,
    resource,
    save,
    setPersistedContent,
    unpublish,
    updateTags,
  };
};
