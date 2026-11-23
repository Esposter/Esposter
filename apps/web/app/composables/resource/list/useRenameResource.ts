import type { ResourceInResource } from "@esposter/db-schema";

import { resourceTable } from "#src/services/resource/overlay/constants";
import { getResourcePatchEntry } from "#src/services/resource/overlay/getResourcePatchEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { withFinalizerAsync } from "@esposter/shared";

// Owned here rather than in the dialog because the dialog closes on submit — the row the rename applies to belongs to the
// List, which outlives the round trip
export const useRenameResource = (resource: Ref<ResourceInResource | undefined>, refresh: () => Promise<void>) => {
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { writeOptimistic } = overlayStore;
  const getResourceRouter = useResourceRouter();
  // A rename moves the favorites and Recent rows, which carry the name, and reorders a name-sorted page and moves updatedAt,
  // Neither of which the client can resolve, so the page is read again once the rename has settled, kept or refused
  const finalizeWrite = useResourceWriteFinalizer(refresh);
  return (name: string) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { id, type } = resourceValue;
    writeOptimistic(
      () =>
        withFinalizerAsync(
          async () =>
            createRowResponse(resourceTable, await getResourceRouter(type).updateResource.mutate({ id, name })),
          finalizeWrite,
        ),
      { entry: getResourcePatchEntry(id, { name }), onError: createErrorNotification },
    );
  };
};
