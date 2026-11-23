import type { AwaitedReason } from "#src/models/shared/AwaitedReason";
import type { Arrival } from "#src/models/shared/overlay/Arrival";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { WriteResponse } from "#src/models/shared/overlay/WriteResponse";
import type { ResourceInResource } from "@esposter/db-schema";

import { CacheTag } from "#src/models/cache/CacheTag";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { getResourcePatchEntry } from "#src/services/resource/overlay/getResourcePatchEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { useCacheStore } from "#src/store/cache";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { withFinalizerAsync } from "@esposter/shared";

// The one way a resource row is written. A write that changes which resources exist, are live or what their cached rows
// Say, such as a create, delete, restore, purge, rename or tag edit, ends here, kept or refused. The Resources tag goes
// Stale, since the stars and the Recent rows carry what a write changed. A list the write shows re-reads too, since its
// Total and its page's membership are the server's to say and not the rows the write moved. A batch a later chunk refuses
// Still ends here, since the chunks before it committed. A surface with no list of its own, such as the blade, passes no
// Refresh. A refused write withdraws the notice it showed, and shows its error in that notice's place
export const useResourceWrite = (refresh?: () => Promise<void>) => {
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, dismissNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { writeAwaited, writeOptimistic } = overlayStore;
  const getResourceRouter = useResourceRouter();
  const finalizeWrite = async () => {
    await invalidateTags([CacheTag.Resources]);
    await refresh?.();
  };
  const writeResourceOptimistic = (
    mutate: () => Promise<WriteResponse>,
    {
      entry,
      notification,
    }: { entry: Entry; notification?: Parameters<ReturnType<typeof useNotificationStore>["createNotification"]>[0] },
  ) => {
    // The notice the write shows at once, while the answer is the server's
    const notificationId = notification ? createNotification(notification) : undefined;
    writeOptimistic(() => withFinalizerAsync(mutate, finalizeWrite), {
      entry,
      onError: (error) => {
        if (notificationId !== undefined) dismissNotification(notificationId);
        createErrorNotification(error);
      },
    });
  };
  return {
    // A rename or a tag edit sends only the fields it names, so the server's row keeps every other field as it is
    updateResource: (resource: ResourceInResource, patch: Partial<Pick<ResourceInResource, "name" | "tags">>) => {
      const { id, type } = resource;
      writeResourceOptimistic(
        async () =>
          createRowResponse(resourceTable, await getResourceRouter(type).updateResource.mutate({ id, ...patch })),
        { entry: getResourcePatchEntry(id, patch) },
      );
    },
    writeAwaited: (mutate: () => Promise<Arrival[]>, { awaitedBecause }: { awaitedBecause: AwaitedReason }) =>
      writeAwaited(() => withFinalizerAsync(mutate, finalizeWrite), {
        awaitedBecause,
        onError: createErrorNotification,
      }),
    writeOptimistic: writeResourceOptimistic,
  };
};
