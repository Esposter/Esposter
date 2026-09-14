// The Tags entry's own read — the one thing the menu adds that the list surface could not already answer,
// Since a grouped count over tag names is not a filter of the resource list. A failure surfaces where the
// Rows render rather than as a toast
export const useReadResourceTagCounts = () => {
  const { $trpc } = useNuxtApp();
  const { data, error, isPending, refresh } = useQuery(() => $trpc.resource.readResourceTagCounts.query(), {
    isInlineError: true,
  });
  const counts = computed(() => data.value ?? []);
  return { counts, error, isPending, refresh };
};
