import type { Resource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { useNotificationStore } from "@/store/notification";
import { MAX_READ_LIMIT, RoutePath, takeOne } from "@esposter/shared";

export const useDeleteResources = (items: Ref<Resource[]>, count: Ref<number>, refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const { createErrorNotification, createNotification } = useNotificationStore();
  const executeDeleteResourcesMutation = useMutation();
  const restoreResource = useRestoreResource(refresh);
  // Owned here because the row leaves `items` optimistically, which unmounts the v-if-gated delete dialog mid-flight
  const deleteResources = async (resources: Resource[]) => {
    const snapshot = [...items.value];
    const snapshotCount = count.value;
    const ids = resources.map(({ id }) => id);
    // Read up front — the optimistic removal drops the rows before the notification fires
    const deletedNotificationTitle =
      resources.length === 1
        ? `Deleted "${takeOne(resources).name}"`
        : `Deleted ${resources.length} ${pluralize("resource", resources.length)}`;
    // The batch procedure with one id shares the exact cleanup path (row + publication + blob directory).
    // Selection accumulates across pages, so the ids are chunked to the server's per-call cap and sent in order
    await executeDeleteResourcesMutation(
      async () => {
        for (let offset = 0; offset < ids.length; offset += MAX_READ_LIMIT)
          await $trpc.resource.deleteResources.mutate({ ids: ids.slice(offset, offset + MAX_READ_LIMIT) });
      },
      {
        applyOptimistic: () => {
          const optimisticItems = items.value.filter(({ id }) => !ids.includes(id));
          items.value = optimisticItems;
          count.value -= resources.length;
          return () => {
            // A refresh, page turn or filter change mid-flight replaces `items` wholesale, so anything but our own
            // Optimistic array means the snapshot is stale and restoring it would undo the newer read
            if (items.value !== optimisticItems) return;

            items.value = snapshot;
            count.value = snapshotCount;
          };
        },
        onError: createErrorNotification,
        onSuccess: () => {
          createNotification({
            // The undo toast: a single delete is one click away from coming back, no bin trip needed
            action:
              resources.length === 1
                ? { handler: () => restoreResource(takeOne(resources)), title: "Restore" }
                : { title: "Go to Recycle bin", to: RoutePath.ResourcesRecycleBin },
            severity: "success",
            title: deletedNotificationTitle,
          });
        },
      },
    );
  };
  return deleteResources;
};
