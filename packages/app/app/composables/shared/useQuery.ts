import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";

interface QueryOptions<TResult> {
  onSuccess?: (result: TResult) => void;
}

export const useQuery = <TResult>(query: () => Promise<TResult>, { onSuccess }: QueryOptions<TResult> = {}) => {
  const { executeQuery } = useMutation();
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
  return { data, refresh };
};
