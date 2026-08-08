import type { Resource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { useNotificationStore } from "@/store/notification";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { MAX_READ_LIMIT, RoutePath, takeOne } from "@esposter/shared";

export const useDeleteResources = (items: Ref<Resource[]>, count: Ref<number>, refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const router = useRouter();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const { executeMutation: executeDeleteResourcesMutation } = useMutation();
  const { restoreResource } = useRestoreResource(refresh);
  const { refreshFavorites, refreshResources } = useRefreshResources(refresh);
  // Owned here because the row leaves `items` optimistically, which unmounts the v-if-gated delete dialog mid-flight
  const deleteResources = async (resources: Resource[]) => {
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
        // Snapshotted here rather than at call time, since this runs when the write is sent: a rollback built
        // From the rows the screen held when the user clicked would undo whatever landed in between
        applyOptimistic: () => {
          const snapshot = [...items.value];
          const snapshotCount = count.value;
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
        // A batch delete spans an arbitrary selection with no single entity id, so each gets a per-call symbol
        key: Symbol("deleteResources"),
        onError: async (error) => {
          createErrorNotification(error);
          // The ids are deleted chunk-by-chunk, each committing independently, so a later chunk's failure
          // Still leaves earlier chunks deleted server-side. The rollback restores every row, so re-read to
          // Reconcile the list — and the stars with it, since an earlier chunk's rows are gone for good
          await refreshResources();
        },
        onSuccess: async () => {
          // A star only resolves while its resource is live, so the set the next surface mounts with is re-read
          await refreshFavorites();
          createNotification({
            // The undo toast: a single delete is one click away from coming back, no bin trip needed
            action:
              resources.length === 1
                ? // Single-use: once the restore lands, a second fire from the bell would target a resource
                  // No longer in the bin, so the action consumes itself on success
                  { handler: () => restoreResource(takeOne(resources)), isSingleUse: true, title: "Restore" }
                : { title: "Go to Recycle bin", to: RoutePath.ResourceExplorerRecycleBin },
            severity: "success",
            title: deletedNotificationTitle,
          });
          // This list also drives the blade's Explorer, so deleting the resource the blade is open on has to
          // Leave it — every later blade action hits requireOwnedResource with deletedAt isNull and throws,
          // So the user sits in an editor that error-toasts on every autosave. The blade's own delete already
          // Routes here, and a delete must not navigate from one entry point and not the other
          if (ids.includes(getRouteParamString(router.currentRoute.value.params.id)))
            await navigateTo(RoutePath.ResourceExplorerAll);
        },
      },
    );
  };
  return deleteResources;
};
