import type { Resource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { CacheTag } from "@/models/cache/CacheTag";
import { useNotificationStore } from "@/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

// A restore returns a Draft, so the row reappears in the list but its publication does not come back
export const useRestoreResource = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const { checkIsPending: checkIsRestorePending, executeMutation: executeRestoreResourceMutation } = useMutation();
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
          severity: NotificationSeverity.Success,
          title: ResourceOperationTitleMap[ResourceOperationType.Restored](resource.name),
        });
        await refresh();
      },
    });
  };
  return { checkIsRestorePending, restoreResource };
};
