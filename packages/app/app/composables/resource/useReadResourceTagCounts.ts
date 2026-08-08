import type { ResourceTagCount } from "#shared/models/resource/ResourceTagCount";

// The Tags entry's own read — the one thing the menu adds that the list surface could not already answer,
// Since a grouped count over tag names is not a filter of the resource list
export const useReadResourceTagCounts = () => {
  const { $trpc } = useNuxtApp();
  const { executeQuery, isPending: isLoading } = useMutation();
  const counts = ref<ResourceTagCount[]>([]);
  const error = ref("");
  // One target, so a slower earlier read can never overwrite the newer one
  const key = Symbol("useReadResourceTagCounts");
  const refresh = async () => {
    error.value = "";
    await executeQuery(() => $trpc.resource.countsByTag.query(), {
      key,
      onError: (readError) => {
        error.value = readError.message;
      },
      onSuccess: (newCounts) => {
        counts.value = newCounts;
      },
    });
  };
  return { counts, error, isLoading, refresh };
};
