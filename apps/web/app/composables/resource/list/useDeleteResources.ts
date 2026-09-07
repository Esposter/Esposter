import type { Resource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { CacheTag } from "@/models/cache/CacheTag";
import { useCacheStore } from "@/store/cache";
import { useNotificationStore } from "@/store/notification";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { NotificationSeverity } from "@esposter/db-schema";
import { MAX_READ_LIMIT, RoutePath, takeOne } from "@esposter/shared";

export const useDeleteResources = (items: Ref<Resource[]>, count: Ref<number>, refresh: () => Promise<void>) => {
  const { $trpc } = useNuxtApp();
  const router = useRouter();
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const { executeMutation: executeDeleteResourcesMutation } = useMutation();
  const { restoreResource } = useRestoreResource(refresh);
  // Owned here because the row leaves `items` optimistically, which unmounts the v-if-gated delete dialog mid-flight
  const deleteResources = async (resources: Resource[]) => {
    const ids = resources.map(({ id }) => id);
    // Read up front — the optimistic removal drops the rows before the notification fires
    const deletedNotificationTitle = ResourceOperationTitleMap[ResourceOperationType.Deleted](
      takeOne(resources).name,
      resources.length,
    );
    // The batch procedure with one id shares the exact cleanup path (row + publication + blob directory).
    // Selection accumulates across pages, so the ids are chunked to the server's per-call cap and sent in order
    await executeDeleteResourcesMutation(
      async () => {
        for (let offset = 0; offset < ids.length; offset += MAX_READ_LIMIT)
          await $trpc.resource.deleteResources.mutate({ ids: ids.slice(offset, offset + MAX_READ_LIMIT) });
      },
      {
        // Read here rather than at call time, since this runs when the write is sent: rows captured when the
        // User clicked are the ones from before whatever landed in between
        applyOptimistic: () => {
          const deletedItems = items.value.filter(({ id }) => ids.includes(id));
          items.value = items.value.filter(({ id }) => !ids.includes(id));
          return () => {
            // Only this write's own rows are put back. A refresh, a page turn or a delete running beside this one
            // Replaces `items` wholesale, so reinstating a copy of the list would undo it — and a mid-flight
            // Refresh has already re-read the rows this failed delete never removed, so only the ones still
            // Missing come back, at the end rather than in their sorted place
            const missingItems = deletedItems.filter(({ id }) => !items.value.some((item) => item.id === id));
            items.value = [...items.value, ...missingItems];
          };
        },
        // A star or a recently-opened row only resolves while its resource is live
        invalidates: [CacheTag.Resources],
        // A batch delete spans an arbitrary selection with no single entity id, so each gets a per-call symbol
        key: Symbol("deleteResources"),
        onError: async (error) => {
          createErrorNotification(error);
          // The ids are deleted chunk-by-chunk, each committing independently, so a later chunk's failure
          // Still leaves earlier chunks deleted server-side — the one write that has to invalidate even
          // Though it failed. The rollback restores every row, so re-read to reconcile the list, and the
          // Stars with it, since an earlier chunk's rows are gone for good
          await invalidateTags([CacheTag.Resources]);
          await refresh();
        },
        onSuccess: async () => {
          // The total is the server's count over the whole filter, not this page's length, so it is only ever
          // Written by a read: nudged by the rows this write removed it would land on top of a refresh that had
          // Already re-counted, and the rollback would add back rows that count never held. The re-read also
          // Refills the page the optimistic removal left short
          await refresh();
          createNotification({
            // The undo toast: a single delete is one click away from coming back, no bin trip needed
            action:
              resources.length === 1
                ? // Single-use: once the restore lands, a second fire from the bell would target a resource
                  // No longer in the bin, so the action consumes itself on success
                  { handler: () => restoreResource(takeOne(resources)), isSingleUse: true, title: "Restore" }
                : { title: "Go to Recycle bin", to: RoutePath.ResourceExplorerRecycleBin },
            severity: NotificationSeverity.Success,
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
