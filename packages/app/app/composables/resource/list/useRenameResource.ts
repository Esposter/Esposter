import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";

// Owned here rather than in the dialog because the dialog closes on submit — the row the rename applies to and
// The rollback that undoes it both belong to the list, which outlives the round trip
export const useRenameResource = (resource: Ref<Resource | undefined>, refresh: () => Promise<void>) => {
  const { createErrorNotification } = useNotificationStore();
  const { executeMutation: executeRenameResourceMutation } = useMutation();
  const getResourceMutations = useResourceMutations();
  return async (name: string) => {
    const current = resource.value;
    if (!current) return;

    const previousName = current.name;
    await executeRenameResourceMutation(
      () => getResourceMutations(current.type).updateResource({ id: current.id, name }),
      {
        applyOptimistic: () => {
          current.name = name;
          return () => {
            current.name = previousName;
          };
        },
        key: current.id,
        onError: createErrorNotification,
        // A rename reorders a name-sorted page and moves updatedAt, neither of which the client can resolve
        onSuccess: refresh,
      },
    );
  };
};
