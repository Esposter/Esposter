import type { Resource } from "@esposter/db-schema";

import { CacheTag } from "@/models/cache/CacheTag";
import { useNotificationStore } from "@/store/notification";
import { RoutePath } from "@esposter/shared";

// A restore returns a Draft, so the row reappears in the list but its publication does not come back
export const useRestoreResource = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const { executeMutation: executeRestoreResourceMutation, getIsPending: getIsRestorePending } = useMutation();
  const restoreResource = async (resource: Resource) => {
    await executeRestoreResourceMutation(() => $trpc.resource.restoreResource.mutate({ id: resource.id }), {
      // The row is reachable again, so every cache of which resources are live is stale — the stars and the
      // Recently-opened set reconcile themselves off this tag
      invalidates: [CacheTag.Resources],
      key: resource.id,
      onError: createErrorNotification,
      onSuccess: async () => {
        createNotification({
          action: { title: "Go to resource", to: RoutePath.Resource(resource.id) },
          severity: "success",
          // A restore returns a Draft — saying so up front beats a surprise when the public link 404s
          title: `Restored "${resource.name}" as a draft`,
        });
        await refresh();
      },
    });
  };
  return { getIsRestorePending, restoreResource };
};
