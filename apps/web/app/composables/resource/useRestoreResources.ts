import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { CacheTag } from "#src/models/cache/CacheTag";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { getRestoreResourcesEntry } from "#src/services/resource/overlay/getRestoreResourcesEntry";
import { sendIdsInChunks } from "#src/services/resource/sendIdsInChunks";
import { createRowsResponse } from "#src/services/shared/overlay/createRowsResponse";
import { useCacheStore } from "#src/store/cache";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { NotificationSeverity } from "@esposter/db-schema";
import { RoutePath, takeOne, withFinalizerAsync } from "@esposter/shared";

// A restore returns a Draft, so the rows reappear in the list but their publications do not come back. A surface with
// No list of its own to re-read, such as the blade, passes no refresh and leaves the caches to the invalidation
export const useRestoreResources = (refresh?: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, dismissNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { writeOptimistic } = overlayStore;
  // The ids with a restore in flight, which the bin reads so a row's Restore is disabled until its answer
  const pendingRestoreIds = ref(new Set<string>());
  const checkIsRestorePending = (id: string) => pendingRestoreIds.value.has(id);
  const restoreResources = (resources: ResourceInResource[]) => {
    const ids = resources.map(({ id }) => id);
    const firstResource = takeOne(resources);
    for (const id of ids) pendingRestoreIds.value.add(id);
    // The toast shows at once, while the rows it brings back are the server's to return, in its order
    const notificationId = createNotification({
      // A batch is back in the list it was deleted from, so only a single resource names where it went
      ...(resources.length === 1
        ? { action: { title: "Go to resource", to: RoutePath.Resource(firstResource.id) } }
        : {}),
      severity: NotificationSeverity.Success,
      title: ResourceOperationTitleMap[ResourceOperationType.Restored](firstResource.name, resources.length),
    });
    writeOptimistic(
      () =>
        withFinalizerAsync(
          // Chunked to the server's per-call cap as the delete that binned them was. The rows it answers arrive at the
          // Versions they name, so the view holds them without a read
          async () =>
            createRowsResponse(
              resourceTable,
              await sendIdsInChunks(ids, (chunkIds) => $trpc.resource.restoreResources.mutate({ ids: chunkIds })),
            ),
          async () => {
            for (const id of ids) pendingRestoreIds.value.delete(id);
            // The ids are restored chunk-by-chunk, each committing independently, so a failure still leaves earlier
            // Chunks restored server-side — a write that has to invalidate even though it reports as failed, as the
            // Delete it undoes does. The rows are reachable again, so every cache of which resources are live is stale:
            // The stars and the Recently-opened set reconcile themselves off this tag
            await invalidateTags([CacheTag.Resources]);
            // The list re-reads once the restore settles, since where the restored rows sort is the server's to say
            await refresh?.();
          },
        ),
      {
        entry: getRestoreResourcesEntry(ids),
        onError: (error) => {
          dismissNotification(notificationId);
          createErrorNotification(error);
        },
      },
    );
  };
  return { checkIsRestorePending, restoreResources };
};
