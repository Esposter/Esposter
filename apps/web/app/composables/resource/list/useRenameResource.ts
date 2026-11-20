import type { ResourceInResource } from "@esposter/db-schema";

import { CacheTag } from "#src/models/cache/CacheTag";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { getResourcePatchEntry } from "#src/services/resource/overlay/getResourcePatchEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { useCacheStore } from "#src/store/cache";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { withFinalizerAsync } from "@esposter/shared";

// Owned here rather than in the dialog because the dialog closes on submit — the row the rename applies to belongs to the
// List, which outlives the round trip
export const useRenameResource = (resource: Ref<ResourceInResource | undefined>, refresh: () => Promise<void>) => {
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { writeOptimistic } = overlayStore;
  const getResourceRouter = useResourceRouter();
  return (name: string) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { id, type } = resourceValue;
    writeOptimistic(
      () =>
        withFinalizerAsync(
          async () =>
            createRowResponse(resourceTable, await getResourceRouter(type).updateResource.mutate({ id, name })),
          async () => {
            // The favorites and Recent rows carry the name, and nothing else re-reads them once they have loaded
            await invalidateTags([CacheTag.Resources]);
            // A rename reorders a name-sorted page and moves updatedAt, neither of which the client can resolve, so the
            // Page is read again once the rename has settled, kept or refused
            await refresh();
          },
        ),
      { entry: getResourcePatchEntry(id, { name }), onError: createErrorNotification },
    );
  };
};
