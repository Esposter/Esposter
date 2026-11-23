import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { GO_TO_RESOURCE_TITLE } from "#src/services/resource/constants";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { getRestoreResourcesEntry } from "#src/services/resource/overlay/getRestoreResourcesEntry";
import { sendIdsInChunks } from "#src/services/resource/sendIdsInChunks";
import { createRowsResponse } from "#src/services/shared/overlay/createRowsResponse";
import { NotificationSeverity } from "@esposter/db-schema";
import { RoutePath, takeOne, withFinalizerAsync } from "@esposter/shared";

// A restore returns a Draft, so the rows reappear in the list but their publications do not come back. A surface with
// No list of its own to re-read, such as the blade, passes no refresh and leaves the caches to the invalidation
export const useRestoreResources = (refresh?: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const { writeOptimistic } = useResourceWrite(refresh);
  // The ids with a restore in flight, which the bin reads so a row's Restore is disabled until its answer
  const pendingRestoreIds = ref(new Set<string>());
  const checkIsRestorePending = (id: string) => pendingRestoreIds.value.has(id);
  const restoreResources = (resources: ResourceInResource[]) => {
    const ids = resources.map(({ id }) => id);
    const firstResource = takeOne(resources);
    for (const id of ids) pendingRestoreIds.value.add(id);
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
          () => {
            for (const id of ids) pendingRestoreIds.value.delete(id);
          },
        ),
      {
        entry: getRestoreResourcesEntry(ids),
        // The toast shows at once, while the rows it brings back are the server's to return, in its order. A batch is
        // Back In the list it was deleted from, so only a single resource names where it went
        notification: {
          ...(resources.length === 1
            ? { action: { title: GO_TO_RESOURCE_TITLE, to: RoutePath.Resource(firstResource.id) } }
            : {}),
          severity: NotificationSeverity.Success,
          title: ResourceOperationTitleMap[ResourceOperationType.Restored](firstResource.name, resources.length),
        },
      },
    );
  };
  return { checkIsRestorePending, restoreResources };
};
