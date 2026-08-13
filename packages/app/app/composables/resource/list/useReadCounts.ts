// The shared shape behind every grouped-count read the explorer does: one target, so a slower earlier read can
// Never overwrite the one the latest filter asked for, and a failure surfaces where the cards render rather
// Than as a toast. Callers supply only the query.
export const useReadCounts = <TCount>(description: string, query: () => Promise<TCount[]>) => {
  const { executeQuery, isPending: isLoading } = useMutation();
  const counts = ref<TCount[]>([]) as Ref<TCount[]>;
  const error = ref("");
  const key = Symbol(description);
  const refresh = async () => {
    error.value = "";
    await executeQuery(query, {
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
