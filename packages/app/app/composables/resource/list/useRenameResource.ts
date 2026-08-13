import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";
import { noop } from "@esposter/shared";

// Owned here rather than in the dialog because the dialog closes on submit — the row the rename applies to and
// The rollback that undoes it both belong to the list, which outlives the round trip
export const useRenameResource = (resource: Ref<Resource | undefined>, refresh: () => Promise<void>) => {
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  const { executeMutation: executeRenameResourceMutation } = useMutation();
  const getResourceRouter = useResourceRouter();
  return async (name: string) => {
    const current = resource.value;
    if (!current) return;

    await executeRenameResourceMutation(
      () => getResourceRouter(current.type).updateResource.mutate({ id: current.id, name }),
      {
        // Applied without a local rollback: the name to restore would be whatever this call happened to read,
        // Which for a second rename of the same row is itself the first call's optimistic value — and only the
        // Newest call's handlers run, so restoring it leaves a name the server never accepted on the row until
        // Some later read. The server's answer is the only true name, so a rejection re-reads for it
        applyOptimistic: () => {
          current.name = name;
          return noop;
        },
        key: current.id,
        onError: async (error) => {
          createErrorNotification(error);
          await refresh();
        },
        // A rename reorders a name-sorted page and moves updatedAt, neither of which the client can resolve
        onSuccess: refresh,
      },
    );
  };
};
