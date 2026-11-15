import type { Topic } from "@esposter/db-schema";

import { collectTopics } from "@/services/realtime/collectTopics";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useConnectionStore } from "@/store/realtime/connection";
import { getSynchronizedFunction, ID_SEPARATOR, noop } from "@esposter/shared";

interface QueryOptions<TResult> {
  // The surface renders the failure itself, as UiErrorState with its retry, so the toast is dropped
  // Rather than stacked on top of it
  isInlineError?: true;
  // The read waits for the first `refresh` rather than firing on setup — a lens the surface opens on demand,
  // Where a fetch at setup would spend a round trip on a read nothing renders yet
  isLazy?: true;
  onSuccess?: (result: TResult) => void;
}

// A read that stays live: the topics its answer came from, which each query procedure sends back with it, are watched
// Over the user socket while the surface is mounted, and a write that changed one refetches it
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
  // The topics the last answer came from. Watched again only when they change, so a refetch that reads the same topics
  // Keeps its subscriptions rather than dropping and retaking them
  const connectionStore = import.meta.client ? useConnectionStore() : undefined;
  let watchedTopicsKey = "";
  let unwatchTopics = noop;
  // A read can answer after its surface has gone, and a watch taken then would outlive it with nothing left to let go
  let isDisposed = false;
  const refresh = async () => {
    error.value = "";
    await executeQuery(() => collectTopics(query), {
      key,
      onError: (readError) => {
        error.value = readError.message;
        if (!isInlineError) createErrorAlert(readError);
      },
      onSuccess: ({ result, topics }) => {
        data.value = result;
        onSuccess?.(result);
        watchTopics(topics);
      },
    });
  };
  const watchTopics = (topics: Topic[]) => {
    const topicsKey = [...new Set(topics)].toSorted().join(ID_SEPARATOR);
    if (!connectionStore || isDisposed || topicsKey === watchedTopicsKey) return;
    unwatchTopics();
    watchedTopicsKey = topicsKey;
    unwatchTopics = topics.length > 0 ? connectionStore.watchTopics(topics, getSynchronizedFunction(refresh)) : noop;
  };
  if (connectionStore)
    onScopeDispose(() => {
      isDisposed = true;
      unwatchTopics();
    });
  // Fetch on setup without blocking it — no Suspense boundary, unlike a top-level awaited query
  if (!isLazy) getSynchronizedFunction(refresh)();
  return { data, error, isPending, refresh };
};
