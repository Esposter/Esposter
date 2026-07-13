import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { STALE_CONTENT_VERSION_MESSAGE } from "#shared/services/resource/constants";
import { useNotificationStore } from "@/store/notification";
import { DatabaseEntityType } from "@esposter/db-schema";
import {
  getResultAsync,
  InvalidOperationError,
  noop,
  Operation,
  RoutePath,
  withFinalizerAsync,
} from "@esposter/shared";

const staleContentVersionErrorMessage = new InvalidOperationError(
  Operation.Update,
  DatabaseEntityType.Resource,
  STALE_CONTENT_VERSION_MESSAGE,
).message;
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
  const { createNotification } = notificationStore;
  const createErrorNotification = (error: Error) => {
    createNotification({ severity: "error", title: error.message });
  };
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
  // Optimistic concurrency: writes the returned row back so the next save carries the bumped contentVersion
  const save = async (content: unknown) => {
    const current = resource.value;
    if (!current) return false;
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
              // A hard reload is the one path guaranteed to re-run every blade's content loader
              action: { handler: () => reloadNuxtApp({ force: true }), title: "Refresh" },
              severity: "warning",
              title: `"${current.name}" was modified elsewhere — refresh to load the latest`,
            });
          else createErrorNotification(error);
        },
        onSuccess: (newResource) => {
          resource.value = newResource;
          isSuccessful = true;
        },
      },
    );
    return isSuccessful;
  };
  const rename = async (name: string) => {
    const current = resource.value;
    if (!current) return;
    await executeRenameMutation(() => getResourceMutations(current.type).updateResource({ id: current.id, name }), {
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
            handler: () =>
              getResultAsync(() =>
                window.navigator.clipboard.writeText(
                  `${window.location.origin}${RoutePath.View(current.type, current.id)}`,
                ),
              ).match(noop, noop),
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
    await executeUnpublishMutation(() => unpublishResource({ id: current.id }), {
      onError: createErrorNotification,
      onSuccess: () => {
        publication.value = undefined;
        createNotification({ severity: "success", title: `Unpublished "${current.name}"` });
      },
    });
  };
  return { duplicate, isLoading, load, publication, publish, readContent, remove, rename, resource, save, unpublish };
};
