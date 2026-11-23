import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { RESTORE_ACTION_TITLE } from "#src/services/resource/constants";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { getDeleteResourcesEntry } from "#src/services/resource/overlay/getDeleteResourcesEntry";
import { sendIdsInChunks } from "#src/services/resource/sendIdsInChunks";
import { createRowsResponse } from "#src/services/shared/overlay/createRowsResponse";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { getRouteParam } from "#src/util/router/getRouteParam";
import { NotificationSeverity } from "@esposter/db-schema";
import { getSynchronizedFunction, RoutePath, takeOne, withFinalizerAsync } from "@esposter/shared";

export const useDeleteResources = (refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const router = useRouter();
  const navigateToExplorer = getSynchronizedFunction(async () => {
    await navigateTo(RoutePath.ResourceExplorerAll);
  });
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, dismissNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { arrive, writeOptimistic } = overlayStore;
  const { restoreResources } = useRestoreResources(refresh);
  const finalizeWrite = useResourceWriteFinalizer(refresh);
  // Owned by the list rather than by whatever triggers it — a row's menu, the selection, a context menu — because the
  // Rows it removes and puts back are the list's, and the write outlives the menu that fired it
  const deleteResources = (resources: ResourceInResource[]) => {
    const ids = resources.map(({ id }) => id);
    const deletedNotificationTitle = ResourceOperationTitleMap[ResourceOperationType.Deleted](
      takeOne(resources).name,
      resources.length,
    );
    const notificationId = createNotification({
      // The undo toast: a delete of one resource or of a whole selection is one click away from coming back, no
      // Bin trip needed. Single-use: once the restore lands, a second fire from the bell would target resources
      // No longer in the bin, so the action consumes itself on success
      action: {
        handler: () => {
          restoreResources(resources);
        },
        isSingleUse: true,
        title: RESTORE_ACTION_TITLE,
      },
      severity: NotificationSeverity.Success,
      title: deletedNotificationTitle,
    });
    // This list also drives the blade's Explorer, so deleting the resource the blade is open on has to
    // Leave it — every later blade action hits requireOwnedResource with deletedAt isNull and throws,
    // So the user sits in an editor that error-toasts on every autosave. The blade's own delete already
    // Routes here, and a delete must not navigate from one entry point and not the other
    if (ids.includes(getRouteParam(router.currentRoute.value.params, "id"))) navigateToExplorer();
    // The batch procedure with one id shares the exact cleanup path (row + publication + blob directory).
    // Selection accumulates across pages, so the ids are chunked to the server's per-call cap and sent in order
    writeOptimistic(
      () =>
        withFinalizerAsync(
          async () =>
            createRowsResponse(
              resourceTable,
              await sendIdsInChunks(ids, async (chunkIds) => {
                const chunkRows = await $trpc.resource.deleteResources.mutate({ ids: chunkIds });
                // Each chunk's rows arrive as it lands, so a later chunk the server refuses leaves these deleted here too
                for (const row of chunkRows) arrive(resourceTable, row);
                return chunkRows;
              }),
            ),
          // The ids are deleted chunk-by-chunk, each committing independently, so a later chunk's failure still leaves
          // Earlier chunks deleted server-side. The stars and the Recent rows go with those rows, so the tag is
          // Invalidated whether the write was kept or refused. The total is the server's count over the whole filter, so
          // It is read again rather than moved by the rows this write removed
          finalizeWrite,
        ),
      {
        entry: getDeleteResourcesEntry(ids, new Date()),
        onError: (error) => {
          dismissNotification(notificationId);
          createErrorNotification(error);
        },
      },
    );
  };
  return deleteResources;
};
