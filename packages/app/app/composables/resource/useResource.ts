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
  const notificationStore = useNotificationStore();
  const { createNotification } = notificationStore;
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
  // Optimistic concurrency: reads the tracked contentVersion and writes the returned row back so the
  // Next save carries the bumped version (sequential autosaves stay consistent)
  const save = (content: unknown): Promise<boolean> => {
    const current = resource.value;
    if (!current) return Promise.resolve(false);
    return getResultAsync(async () => {
      resource.value = await getResourceMutations(current.type).saveResourceContent({
        content,
        contentVersion: current.contentVersion,
        id: current.id,
      });
    }).match(
      () => true,
      (error) => {
        if (error.message === staleContentVersionErrorMessage)
          createNotification({
            // A hard reload is the one path guaranteed to re-run every blade's content loader
            action: { handler: () => reloadNuxtApp({ force: true }), title: "Refresh" },
            severity: "warning",
            title: `"${current.name}" was modified elsewhere — refresh to load the latest`,
          });
        else createNotification({ severity: "error", title: error.message });
        return false;
      },
    );
  };
  const rename = (name: string) => {
    const current = resource.value;
    if (!current) return Promise.resolve();
    return getResultAsync(async () => {
      resource.value = await getResourceMutations(current.type).updateResource({ id: current.id, name });
    }).match(noop, (error) => {
      createNotification({ severity: "error", title: error.message });
    });
  };
  const remove = () => {
    const current = resource.value;
    if (!current) return Promise.resolve(false);
    return getResultAsync(() => getResourceMutations(current.type).deleteResource({ id: current.id })).match(
      () => {
        createNotification({ severity: "success", title: `Deleted "${current.name}"` });
        return true;
      },
      (error) => {
        createNotification({ severity: "error", title: error.message });
        return false;
      },
    );
  };
  const duplicate = () => {
    const current = resource.value;
    if (!current) return Promise.resolve();
    return getResultAsync(async () => {
      const newResource = await $trpc.resource.duplicateResource.mutate({ id: current.id });
      createNotification({
        action: { title: "Go to resource", to: RoutePath.Resource(newResource.id) },
        severity: "success",
        title: `Created "${newResource.name}"`,
      });
      await navigateTo(RoutePath.Resource(newResource.id));
    }).match(noop, (error) => {
      createNotification({ severity: "error", title: error.message });
    });
  };
  const publish = () => {
    const current = resource.value;
    if (!current) return Promise.resolve();
    const { publishResource } = getResourceMutations(current.type);
    if (!publishResource) return Promise.resolve();
    return getResultAsync(async () => {
      publication.value = await publishResource({ id: current.id });
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
        title: `Published "${current.name}" (v${publication.value.publishVersion})`,
      });
    }).match(noop, (error) => {
      createNotification({ severity: "error", title: error.message });
    });
  };
  const unpublish = () => {
    const current = resource.value;
    if (!current) return Promise.resolve();
    const { unpublishResource } = getResourceMutations(current.type);
    if (!unpublishResource) return Promise.resolve();
    return getResultAsync(async () => {
      await unpublishResource({ id: current.id });
      publication.value = undefined;
      createNotification({ severity: "success", title: `Unpublished "${current.name}"` });
    }).match(noop, (error) => {
      createNotification({ severity: "error", title: error.message });
    });
  };
  return { duplicate, isLoading, load, publication, publish, readContent, remove, rename, resource, save, unpublish };
};
