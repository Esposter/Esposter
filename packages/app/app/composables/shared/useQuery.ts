import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";

interface QueryOptions<TResult> {
  onSuccess?: (result: TResult) => void;
}

export const useQuery = <TResult>(query: () => Promise<TResult>, { onSuccess }: QueryOptions<TResult> = {}) => {
  const { executeQuery, isPending } = useMutation();
  const data = shallowRef<TResult>();
  // One instance reads one target, so every refresh supersedes the fetch before it and a slower earlier
  // Response can never overwrite a newer one
  const key = Symbol("useQuery");
  const refresh = async () => {
    await executeQuery(query, {
      key,
      onSuccess: (result) => {
        data.value = result;
        onSuccess?.(result);
      },
    });
  };
  // Fetch on setup without blocking it — no Suspense boundary, unlike a top-level awaited query
  getSynchronizedFunction(refresh)();
  // The instance reads one target, so the primitive's pending state is this read's loading flag — a consumer
  // Rendering a spinner takes it from here rather than keeping an isLoading ref of its own
  return { data, isPending, refresh };
};
