import { dayjs } from "#shared/services/dayjs";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, normalizeString } from "@esposter/shared";

export interface UseAutoSearchOptions {
  isIncludeEmptySearchQuery?: true;
  // Called when the query empties out so the consumer can drop stale results
  reset: () => void;
  search: (searchQuery: string, signal: AbortSignal) => Promise<void>;
}
// The shared core for search-as-you-type: 1s throttle, in-flight abort, and normalized-query change detection
export const useAutoSearch = (
  searchQuery: Ref<string>,
  { isIncludeEmptySearchQuery, reset, search }: UseAutoSearchOptions,
) => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const isPending = ref(false);
  const throttledSearchQuery = useThrottle(searchQuery, dayjs.duration(1, "second").asMilliseconds());
  const isSearchQueryEmpty = computed(() => !normalizeString(searchQuery.value));
  let abortController: AbortController | undefined;
  // The query the results on screen came from, rather than the throttled ref's previous value: emptying the box
  // Discards those results, so the same string typed again inside one throttle window is a new search even though
  // The throttled value never changed — comparing against the ref would leave that group permanently empty
  let searchedQuery: string | undefined;

  watch(isSearchQueryEmpty, (newIsSearchQueryEmpty) => {
    if (isIncludeEmptySearchQuery || !newIsSearchQueryEmpty) return;
    abortController?.abort();
    isPending.value = false;
    searchedQuery = undefined;
    reset();
  });

  watch(
    throttledSearchQuery,
    async (newThrottledSearchQuery) => {
      const sanitizedNewThrottledSearchQuery = normalizeString(newThrottledSearchQuery);
      if (
        sanitizedNewThrottledSearchQuery === searchedQuery ||
        !(isIncludeEmptySearchQuery || sanitizedNewThrottledSearchQuery)
      )
        return;

      searchedQuery = sanitizedNewThrottledSearchQuery;
      abortController?.abort();
      const newAbortController = new AbortController();
      abortController = newAbortController;
      isPending.value = true;
      await getResultAsync(() => search(sanitizedNewThrottledSearchQuery, newAbortController.signal)).match(
        () => {
          // An aborted call was superseded — the newer call owns isPending now
          if (!newAbortController.signal.aborted) isPending.value = false;
        },
        (error) => {
          if (newAbortController.signal.aborted) return;
          isPending.value = false;
          // Nothing was rendered for it, so retyping the same query is a retry rather than a repeat
          searchedQuery = undefined;
          createAlert(error.message, "error");
        },
      );
    },
    { immediate: isIncludeEmptySearchQuery },
  );

  return { isPending };
};
