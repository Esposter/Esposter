import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { CacheTag } from "#src/models/cache/CacheTag";
import { getRestoredItems } from "#src/services/shared/getRestoredItems";
import { useNotificationStore } from "#src/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";

// The bin's row leaves the list as the purge is sent, and comes back where it stood if the server refuses it. The count
// The bin shows is the server's, so it is read again once the purge is kept
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
        const purgedIndex = items.value.findIndex(({ id }) => id === resource.id);
        const purgedItem = items.value[purgedIndex];
        items.value = items.value.filter(({ id }) => id !== resource.id);
        return () => {
          dismissNotification(notificationId);
          // The row goes back where it stood, since the bin is sorted; getRestoredItems leaves it alone when a refresh
          // That ran while the purge was in flight has already re-read it
          if (purgedItem) items.value = getRestoredItems(items.value, purgedItem, purgedIndex);
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
