import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { NotificationSeverity } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

// A purge is an awaited write. The bin's page is a plain read rather than an overlay list, so the row stays on it until the
// Purge is answered, and the re-read that follows takes the row away and reads the count the bin shows again
export const usePurgeResource = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { writeAwaited } = overlayStore;
  // The resource can never come back, so a star it still holds must not survive in Home's Favorites list
  const finalizeWrite = useResourceWriteFinalizer(refresh);
  // Returned as the write itself, so the dialog that asks for the purge waits on the answer it awaits
  return (resource: ResourceInResource) =>
    writeAwaited(
      () =>
        withFinalizerAsync(async () => {
          await $trpc.resource.purgeResource.mutate({ id: resource.id });
          createNotification({
            severity: NotificationSeverity.Success,
            title: ResourceOperationTitleMap[ResourceOperationType.Purged](resource.name),
          });
          return [];
        }, finalizeWrite),
      { awaitedBecause: AwaitedReason.IrreversibleStep, onError: createErrorNotification },
    );
};
