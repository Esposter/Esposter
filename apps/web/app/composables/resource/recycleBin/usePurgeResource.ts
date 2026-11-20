import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { CacheTag } from "#src/models/cache/CacheTag";
import { useCacheStore } from "#src/store/cache";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { NotificationSeverity } from "@esposter/db-schema";
import { getSynchronizedFunction, withFinalizerAsync } from "@esposter/shared";

// A purge is an awaited write. The bin's page is a plain read rather than an overlay list, so the row stays on it until the
// Purge is answered, and the re-read that follows takes the row away and reads the count the bin shows again
export const usePurgeResource = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { writeAwaited } = overlayStore;
  const purgeResource = (resource: ResourceInResource) => {
    getSynchronizedFunction(() =>
      writeAwaited(
        () =>
          withFinalizerAsync(
            async () => {
              await $trpc.resource.purgeResource.mutate({ id: resource.id });
              createNotification({
                severity: NotificationSeverity.Success,
                title: ResourceOperationTitleMap[ResourceOperationType.Purged](resource.name),
              });
              return [];
            },
            async () => {
              // The resource can never come back, so a star it still holds must not survive in Home's Favorites list
              await invalidateTags([CacheTag.Resources]);
              await refresh();
            },
          ),
        { onError: createErrorNotification },
      ),
    )();
  };
  return purgeResource;
};
