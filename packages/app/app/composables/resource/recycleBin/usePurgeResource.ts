import type { Resource } from "@esposter/db-schema";

import { CacheTag } from "@/models/cache/CacheTag";
import { useNotificationStore } from "@/store/notification";

export const usePurgeResource = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const { executeMutation: executePurgeMutation } = useMutation();
  const purgeResource = async (resource: Resource) => {
    await executePurgeMutation(() => $trpc.resource.purgeResource.mutate({ id: resource.id }), {
      // The resource can never come back, so a star it still holds must not survive in Home's Favorites list
      invalidates: [CacheTag.Resources],
      key: resource.id,
      onError: createErrorNotification,
      onSuccess: async () => {
        createNotification({ severity: "success", title: `Permanently deleted "${resource.name}"` });
        await refresh();
      },
    });
  };
  return purgeResource;
};
