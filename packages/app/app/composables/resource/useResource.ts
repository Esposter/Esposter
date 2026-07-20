import type { Resource, ResourcePublication, ResourceTags } from "@esposter/db-schema";

import { staleContentVersionErrorMessage } from "#shared/services/resource/constants";
import { getSequentialFunction } from "#shared/util/function/getSequentialFunction";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { useNotificationStore } from "@/store/notification";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

// Blade-scoped state for one resource (metadata + content + publication)
export const useResource = (id: MaybeRefOrGetter<string>) => {
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
  const getResourceMutations = useResourceMutations();
  const resource = ref<Resource>();
  const publication = ref<ResourcePublication>();
  const isLoading = ref(false);
  const load = async () => {
    // Resolved per call so a persisted store's loader always reads the current route id
    const idValue = toValue(id);
    isLoading.value = true;
    await withFinalizerAsync(
      async () => {
        resource.value = await $trpc.resource.readResource.query({ id: idValue });
        publication.value = await getResourceMutations(resource.value.type).readResourcePublication?.({ id: idValue });
        // A fresh read carries the current contentVersion, so saving is meaningful again
        isContentStale = false;
      },
      () => {
        isLoading.value = false;
      },
    );
  };
  // The blob is written on first save, so a freshly created resource returns undefined content
  const readContent = () => {
    const current = resource.value;
    if (!current) return Promise.resolve(undefined);
    return getResourceMutations(current.type).readResourceContent({ id: current.id });
  };
  // The last content shape known to be persisted — save() skips the write when nothing changed, so a
  // Load-echoed autosave or an unedited explicit save never bumps contentVersion over the wire.
  // Stores seed it after hydrating so the first debounced watch tick has something to compare against
  let persistedContentJson: string | undefined;
  const setPersistedContent = (content: unknown) => {
    persistedContentJson = JSON.stringify(content);
  };
  // A stale contentVersion can only be cured by reloading, so once the server rejects a save every
  // Retry is a guaranteed rejection — the flag turns save() into a no-op (and the warning into a
  // One-shot) until the next load() reads a fresh version
  let isContentStale = false;
  // Serialized so each save picks up the contentVersion the previous one wrote back.
  // The server's optimistic-concurrency rejection then only fires for genuine cross-session edits, not our own overlapping saves.
  const save = getSequentialFunction(async (content: unknown) => {
    const current = resource.value;
    if (!current || isContentStale) return false;
    const contentJson = JSON.stringify(content);
    if (contentJson === persistedContentJson) return true;
    let isSuccessful = false;
    await executeSaveMutation(
      () =>
        getResourceMutations(current.type).saveResourceContent({
          content,
          contentVersion: current.contentVersion,
          id: current.id,
        }),
      {
        // Content saves of the current resource supersede one another, so they share the resource id
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
          // The save only bumps contentVersion, so only its fields are merged — replacing the whole ref
          // With this row snapshot would clobber a concurrently in-flight optimistic rename/tag edit
          resource.value = resource.value
            ? { ...resource.value, contentVersion: newResource.contentVersion, updatedAt: newResource.updatedAt }
            : newResource;
          persistedContentJson = contentJson;
          isSuccessful = true;
        },
      },
    );
    return isSuccessful;
  });
  const rename = async (name: string) => {
    const current = resource.value;
    if (!current) return;
    await executeRenameMutation(() => getResourceMutations(current.type).updateResource({ id: current.id, name }), {
      // Apply, rollback and success all touch only the name — the ref may have absorbed other
      // Concurrent edits (autosave contentVersion, tags) by the time they run
      applyOptimistic: () => {
        resource.value = { ...current, name };
        return () => {
          resource.value = resource.value ? { ...resource.value, name: current.name } : current;
        };
      },
      key: current.id,
      onError: createErrorNotification,
      onSuccess: (newResource) => {
        resource.value = resource.value
          ? { ...resource.value, name: newResource.name, updatedAt: newResource.updatedAt }
          : newResource;
      },
    });
  };
  // Whole-record replace, which is Azure's own tag update semantics — the dialog always sends every tag
  const updateTags = async (tags: ResourceTags) => {
    const current = resource.value;
    if (!current) return;
    await executeUpdateTagsMutation(
      () => getResourceMutations(current.type).updateResource({ id: current.id, name: current.name, tags }),
      {
        // Apply, rollback and success all touch only the tags — the ref may have absorbed other
        // Concurrent edits (autosave contentVersion, rename) by the time they run
        applyOptimistic: () => {
          resource.value = { ...current, tags };
          return () => {
            resource.value = resource.value ? { ...resource.value, tags: current.tags } : current;
          };
        },
        key: current.id,
        onError: createErrorNotification,
        onSuccess: (newResource) => {
          resource.value = resource.value
            ? { ...resource.value, tags: newResource.tags, updatedAt: newResource.updatedAt }
            : newResource;
        },
      },
    );
  };
  const remove = async () => {
    const current = resource.value;
    if (!current) return false;
    let isSuccessful = false;
    await executeRemoveMutation(() => getResourceMutations(current.type).deleteResource({ id: current.id }), {
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
    if (!current) return;
    const { publishResource } = getResourceMutations(current.type);
    if (!publishResource) return;
    await executePublishMutation(() => publishResource({ id: current.id }), {
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
    if (!current) return;
    const { unpublishResource } = getResourceMutations(current.type);
    if (!unpublishResource) return;
    const currentPublication = publication.value;
    await executeUnpublishMutation(() => unpublishResource({ id: current.id }), {
      applyOptimistic: () => {
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
