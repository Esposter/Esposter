import { AUTO_SEARCH_THROTTLE_MS } from "@/services/shared/constants";
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
  const isSearchQueryEmpty = computed(() => !normalizeString(searchQuery.value));
  let abortController: AbortController | undefined;
  // The query the results on screen came from, rather than the previous query: emptying the box discards those
  // Results, so the same string typed again is a new search even though the string never changed
  let searchedQuery: string | undefined;
  // The throttle sits on the call rather than on a throttled copy of the query, because emptying the box and
  // Retyping the same string within one window leaves that copy holding the value it already held — a watcher on
  // It would never fire, and the group it feeds would stay permanently empty
  const throttledSearch = useThrottleFn(
    async (sanitizedSearchQuery: string) => {
      if (sanitizedSearchQuery === searchedQuery || !(isIncludeEmptySearchQuery || sanitizedSearchQuery)) return;

      searchedQuery = sanitizedSearchQuery;
      abortController?.abort();
      const newAbortController = new AbortController();
      abortController = newAbortController;
      isPending.value = true;
      await getResultAsync(() => search(sanitizedSearchQuery, newAbortController.signal)).match(
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
    AUTO_SEARCH_THROTTLE_MS,
    true,
  );

  watch(isSearchQueryEmpty, (newIsSearchQueryEmpty) => {
    if (isIncludeEmptySearchQuery || !newIsSearchQueryEmpty) return;
    abortController?.abort();
    isPending.value = false;
    searchedQuery = undefined;
    reset();
  });

  watch(
    searchQuery,
    async (newSearchQuery) => {
      await throttledSearch(normalizeString(newSearchQuery));
    },
    { immediate: isIncludeEmptySearchQuery },
  );

  return { isPending };
};
