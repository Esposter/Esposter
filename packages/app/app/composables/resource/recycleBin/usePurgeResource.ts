import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";
import { useFavoriteStore } from "@/store/resource/favorite";

export const usePurgeResource = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createNotification } = notificationStore;
  const favoriteStore = useFavoriteStore();
  const { invalidateFavorites } = favoriteStore;
  const { executeMutation: executePurgeMutation } = useMutation();
  const purgeResource = async (resource: Resource) => {
    await executePurgeMutation(() => $trpc.resource.purgeResource.mutate({ id: resource.id }), {
      // Keyed per resource so concurrent purges run independently instead of queueing behind each other
      key: resource.id,
      onError: (purgeError) => {
        createNotification({ severity: "error", title: purgeError.message });
      },
      onSuccess: async () => {
        createNotification({ severity: "success", title: `Permanently deleted "${resource.name}"` });
        // The resource can never come back, so a star it still holds must not survive in Home's Favorites list
        invalidateFavorites();
        await refresh();
      },
    });
  };
  return purgeResource;
};
