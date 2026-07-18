import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";

export const usePurgeResource = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const { createNotification } = useNotificationStore();
  const executePurgeMutation = useMutation();
  const purgeResource = async (resource: Resource) => {
    await executePurgeMutation(() => $trpc.resource.purgeResource.mutate({ id: resource.id }), {
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
