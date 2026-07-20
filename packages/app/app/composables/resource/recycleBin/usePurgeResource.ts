import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";

export const usePurgeResource = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const { createNotification } = useNotificationStore();
  const { executeMutation: executePurgeMutation } = useMutation();
  const purgeResource = async (resource: Resource) => {
    await executePurgeMutation(() => $trpc.resource.purgeResource.mutate({ id: resource.id }), {
      // Keyed per resource so concurrent purges never stale-drop each other's notifications
      key: resource.id,
      onError: (purgeError) => {
        createNotification({ severity: "error", title: purgeError.message });
      },
      onSuccess: async () => {
        createNotification({ severity: "success", title: `Permanently deleted "${resource.name}"` });
        await refresh();
      },
    });
  };
  return purgeResource;
};
