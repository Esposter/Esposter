import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { CacheTag } from "#src/models/cache/CacheTag";
import { sendIdsInChunks } from "#src/services/resource/sendIdsInChunks";
import { useCacheStore } from "#src/store/cache";
import { useNotificationStore } from "#src/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";
import { RoutePath, takeOne } from "@esposter/shared";

// A restore returns a Draft, so the rows reappear in the list but their publications do not come back. A surface with
// No list of its own to re-read, such as the blade, passes no refresh and leaves the caches to the invalidation
export const useRestoreResources = (refresh?: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, dismissNotification } = notificationStore;
  const { checkIsPending: checkIsRestorePending, executeMutation: executeRestoreResourcesMutation } = useMutation();
  const restoreResources = (resources: ResourceInResource[]) => {
    const ids = resources.map(({ id }) => id);
    const firstResource = takeOne(resources);
    // Chunked to the server's per-call cap as the delete that binned them was
    executeRestoreResourcesMutation(
      () => sendIdsInChunks(ids, (chunkIds) => $trpc.resource.restoreResources.mutate({ ids: chunkIds })),
      {
        // The toast shows at once, while the rows it brings back are the server's to return, in its order
        applyOptimistic: () => {
          const notificationId = createNotification({
            // A batch is back in the list it was deleted from, so only a single resource names where it went
            ...(resources.length === 1
              ? { action: { title: "Go to resource", to: RoutePath.Resource(firstResource.id) } }
              : {}),
            severity: NotificationSeverity.Success,
            title: ResourceOperationTitleMap[ResourceOperationType.Restored](firstResource.name, resources.length),
          });
          return () => {
            dismissNotification(notificationId);
          };
        },
        // The rows are reachable again, so every cache of which resources are live is stale — the stars and the
        // Recently-opened set reconcile themselves off this tag
        invalidates: [CacheTag.Resources],
        // One resource keys by its id, so a bin row shows its own restore pending; a batch has no single id
        key: resources.length === 1 ? firstResource.id : Symbol("restoreResources"),
        onError: async (error) => {
          createErrorNotification(error);
          // The ids are restored chunk-by-chunk, each committing independently, so a failure still leaves earlier
          // Chunks restored server-side — a write that has to invalidate even though it reports as failed, as the
          // Delete it undoes does
          await invalidateTags([CacheTag.Resources]);
          await refresh?.();
        },
        // The list re-reads once the restore is kept, since where the restored rows sort is the server's to say
        reconcile: async () => {
          await refresh?.();
        },
      },
    );
  };
  return { checkIsRestorePending, restoreResources };
};
