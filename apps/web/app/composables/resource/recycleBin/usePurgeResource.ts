import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { CacheTag } from "#src/models/cache/CacheTag";
import { useNotificationStore } from "#src/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";

// The bin's row leaves the list as the purge is sent, and comes back if the server refuses it. The count the bin shows
// Is the server's, so it is read again once the purge is kept
export const usePurgeResource = (items: Ref<ResourceListItem[]>, refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, dismissNotification } = notificationStore;
  const { executeMutation: executePurgeMutation } = useMutation();
  const purgeResource = (resource: ResourceInResource) => {
    executePurgeMutation(() => $trpc.resource.purgeResource.mutate({ id: resource.id }), {
      applyOptimistic: () => {
        const notificationId = createNotification({
          severity: NotificationSeverity.Success,
          title: ResourceOperationTitleMap[ResourceOperationType.Purged](resource.name),
        });
        const purgedItem = items.value.find(({ id }) => id === resource.id);
        items.value = items.value.filter(({ id }) => id !== resource.id);
        return () => {
          dismissNotification(notificationId);
          // A refresh that ran while the purge was in flight has already re-read the row, so it is put back only if it is missing
          if (purgedItem && !items.value.some(({ id }) => id === resource.id))
            items.value = [...items.value, purgedItem];
        };
      },
      // The resource can never come back, so a star it still holds must not survive in Home's Favorites list
      invalidates: [CacheTag.Resources],
      key: resource.id,
      onError: createErrorNotification,
      reconcile: refresh,
    });
  };
  return purgeResource;
};
