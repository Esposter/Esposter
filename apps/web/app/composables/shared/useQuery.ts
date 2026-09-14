import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";

interface QueryOptions<TResult> {
  // The surface renders the failure itself, as the StyledErrorState with its retry, so the toast is dropped
  // Rather than stacked on top of it
  isInlineError?: true;
  // The read waits for the first `refresh` rather than firing on setup — a lens the surface opens on demand,
  // Where a fetch at setup would spend a round trip on a read nothing renders yet
  isLazy?: true;
  onSuccess?: (result: TResult) => void;
}

export const useQuery = <TResult>(
  query: () => Promise<TResult>,
  { isInlineError, isLazy, onSuccess }: QueryOptions<TResult> = {},
) => {
  const { executeQuery, isPending } = useMutation();
  const data = shallowRef<TResult>();
  // The message of the last failed read, empty while the read is in flight or has landed. `data` cannot carry
  // This: a read that answers no row leaves it undefined too, so a surface gating on data alone renders its
  // Empty case over a read that never happened — and a form doing that initialises on defaults it would persist
  const error = ref("");
  // One instance reads one target, so every refresh supersedes the fetch before it and a slower earlier
  // Response can never overwrite a newer one
  const key = Symbol("useQuery");
  const refresh = async () => {
    error.value = "";
    await executeQuery(query, {
      key,
      onError: (readError) => {
        error.value = readError.message;
        if (!isInlineError) createErrorAlert(readError);
      },
      onSuccess: (result) => {
        data.value = result;
        onSuccess?.(result);
      },
    });
  };
  // Fetch on setup without blocking it — no Suspense boundary, unlike a top-level awaited query
  if (!isLazy) getSynchronizedFunction(refresh)();
  // The instance reads one target, so the primitive's pending state is this read's loading flag — a consumer
  // Rendering a spinner takes it from here rather than keeping an isLoading ref of its own
  return { data, error, isPending, refresh };
};
