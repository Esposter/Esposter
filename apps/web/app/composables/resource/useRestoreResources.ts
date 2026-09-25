import type { Resource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { CacheTag } from "@/models/cache/CacheTag";
import { useNotificationStore } from "@/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";
import { MAX_READ_LIMIT, RoutePath, takeOne } from "@esposter/shared";

// A restore returns a Draft, so the rows reappear in the list but their publications do not come back. A surface with
// No list of its own to re-read, such as the blade, passes no refresh and leaves the caches to the invalidation
export const useRestoreResources = (refresh?: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const { checkIsPending: checkIsRestorePending, executeMutation: executeRestoreResourcesMutation } = useMutation();
  const restoreResources = async (resources: Resource[]) => {
    const ids = resources.map(({ id }) => id);
    const firstResource = takeOne(resources);
    await executeRestoreResourcesMutation(
      async () => {
        // Chunked to the server's per-call cap as the delete that binned them was
        for (let offset = 0; offset < ids.length; offset += MAX_READ_LIMIT)
          // oxlint-disable-next-line no-await-in-loop -- Committed prefix, as the delete's chunks are
          await $trpc.resource.restoreResources.mutate({ ids: ids.slice(offset, offset + MAX_READ_LIMIT) });
      },
      {
        // The rows are reachable again, so every cache of which resources are live is stale — the stars and the
        // Recently-opened set reconcile themselves off this tag
        invalidates: [CacheTag.Resources],
        // One resource keys by its id, so a bin row shows its own restore pending; a batch has no single id
        key: resources.length === 1 ? firstResource.id : Symbol("restoreResources"),
        onError: createErrorNotification,
        onSuccess: async () => {
          createNotification({
            // A batch is back in the list it was deleted from, so only a single resource names where it went
            ...(resources.length === 1
              ? { action: { title: "Go to resource", to: RoutePath.Resource(firstResource.id) } }
              : {}),
            severity: NotificationSeverity.Success,
            title: ResourceOperationTitleMap[ResourceOperationType.Restored](firstResource.name, resources.length),
          });
          await refresh?.();
        },
      },
    );
  };
  return { checkIsRestorePending, restoreResources };
};
