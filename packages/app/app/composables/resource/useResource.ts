import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { staleContentVersionErrorMessage } from "#shared/services/resource/constants";
import { getSequentialFunction } from "#shared/util/function/getSequentialFunction";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { useNotificationStore } from "@/store/notification";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

// Blade-scoped state for one resource (metadata + content + publication)
export const useResource = (id: MaybeRefOrGetter<string>) => {
  const { $trpc } = useNuxtApp();
  const executeSaveMutation = useMutation();
  const executeRenameMutation = useMutation();
  const executeRemoveMutation = useMutation();
  const executeDuplicateMutation = useMutation();
  const executePublishMutation = useMutation();
  const executeUnpublishMutation = useMutation();
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
  // Serialized so each save picks up the contentVersion the previous one wrote back.
  // The server's optimistic-concurrency rejection then only fires for genuine cross-session edits, not our own overlapping saves.
  const save = getSequentialFunction(async (content: unknown) => {
    const current = resource.value;
    if (!current) return false;
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
        onError: (error) => {
          if (error.message === staleContentVersionErrorMessage)
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
          else createErrorNotification(error);
        },
        onSuccess: (newResource) => {
          resource.value = newResource;
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
      applyOptimistic: () => {
        resource.value = { ...current, name };
        return () => {
          resource.value = current;
        };
      },
      onError: createErrorNotification,
      onSuccess: (newResource) => {
        resource.value = newResource;
      },
    });
  };
  const remove = async () => {
    const current = resource.value;
    if (!current) return false;
    let isSuccessful = false;
    await executeRemoveMutation(() => getResourceMutations(current.type).deleteResource({ id: current.id }), {
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
      onError: createErrorNotification,
      onSuccess: () => {
        createNotification({ severity: "success", title: `Unpublished "${current.name}"` });
      },
    });
  };
  return {
    duplicate,
    isLoading,
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
  };
};
