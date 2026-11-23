import { AUTO_SEARCH_THROTTLE_MS } from "#src/services/shared/constants";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getResultAsync, normalizeString } from "@esposter/shared";

interface UseAutoSearchOptions {
  isIncludeEmptySearchQuery?: true | undefined;
  // Called when the query empties out so the consumer can drop stale results
  reset: () => void;
  search: (searchQuery: string, signal: AbortSignal) => Promise<void>;
}
// The shared core for search-as-you-type: 1s throttle, in-flight abort, and normalized-query change detection
export const useAutoSearch = (
  searchQuery: Ref<string>,
  { isIncludeEmptySearchQuery, reset, search }: UseAutoSearchOptions,
) => {
  const isPending = ref(false);
  // Whether the last search failed, so what shows its results can say so rather than read as finding nothing
  const isError = ref(false);
  // Whether a query is searched at all: an empty one only when the consumer searches the empty query too
  const isSearchableQuery = (sanitizedSearchQuery: string) =>
    isIncludeEmptySearchQuery || Boolean(sanitizedSearchQuery);
  const isSearchable = computed(() => isSearchableQuery(normalizeString(searchQuery.value)));
  let abortController: AbortController | undefined;
  // The query the results on screen came from, rather than the previous query: emptying the box discards those
  // Results, so the same string typed again is a new search even though the string never changed
  const searchedQuery = ref<string | undefined>();
  // A search is owed from the moment the box holds text the last search did not run for, until it starts
  // The throttle may hold it back. A failed search is the error state instead, so it is not pending
  const isSearchOwed = computed(() => isSearchable.value && normalizeString(searchQuery.value) !== searchedQuery.value);
  // The throttle sits on the call rather than on a throttled copy of the query, because emptying the box and
  // Retyping the same string within one window leaves that copy holding the value it already held — a watcher on
  // It would never fire, and the group it feeds would stay permanently empty
  const throttledSearch = useThrottleFn(
    async (sanitizedSearchQuery: string) => {
      if (sanitizedSearchQuery === searchedQuery.value || !isSearchableQuery(sanitizedSearchQuery)) return;

      searchedQuery.value = sanitizedSearchQuery;
      abortController?.abort();
      const newAbortController = new AbortController();
      abortController = newAbortController;
      isPending.value = true;
      isError.value = false;
      await getResultAsync(() => search(sanitizedSearchQuery, newAbortController.signal)).match(
        () => {
          // An aborted call's controller was replaced by a newer search's, which owns isPending now
          if (!newAbortController.signal.aborted) isPending.value = false;
        },
        (error) => {
          if (newAbortController.signal.aborted) return;
          isPending.value = false;
          isError.value = true;
          // Nothing was rendered for it, so retyping the same query is a retry rather than a repeat
          searchedQuery.value = undefined;
          createErrorAlert(error);
        },
      );
    },
    AUTO_SEARCH_THROTTLE_MS,
    true,
  );

  watch(isSearchable, (newIsSearchable) => {
    if (newIsSearchable) return;
    abortController?.abort();
    isPending.value = false;
    // A failure is about a query that no longer has results on screen, so emptying the box clears it too
    isError.value = false;
    searchedQuery.value = undefined;
    reset();
  });

  watch(
    searchQuery,
    async (newSearchQuery) => {
      await throttledSearch(normalizeString(newSearchQuery));
    },
    // A box that starts with a query searches it at once, since nothing else would schedule that search
    { immediate: isSearchable.value },
  );
  // The failed search again, as a retry button asks
  const retry = () => throttledSearch(normalizeString(searchQuery.value));
  return { isError, isPending: computed(() => isPending.value || (isSearchOwed.value && !isError.value)), retry };
};
