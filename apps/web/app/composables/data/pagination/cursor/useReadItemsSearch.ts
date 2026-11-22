import { useAutoSearch } from "#src/composables/useAutoSearch";
import { noop, normalizeString } from "@esposter/shared";

// A search-as-you-type over a readItems read. readItems records a failed read rather than throwing it, so useAutoSearch
// never sees one: the search takes its outcome from the read it issued, and retry reads again. A search that was aborted
// leaves its outcome to the newer search that aborted it
export const useReadItemsSearch = (
  searchQuery: Ref<string>,
  readItemsSearch: (newSearchQuery: string, signal?: AbortSignal) => Promise<{ isError: Ref<boolean> }>,
) => {
  const isError = ref(false);
  const isPending = ref(true);
  const search = async (newSearchQuery: string, signal?: AbortSignal) => {
    isPending.value = true;
    const { isError: isReadError } = await readItemsSearch(newSearchQuery, signal);
    if (signal?.aborted) return;
    isError.value = isReadError.value;
    isPending.value = false;
  };
  useAutoSearch(searchQuery, { isIncludeEmptySearchQuery: true, reset: noop, search });
  return { isError, isPending, retry: () => search(normalizeString(searchQuery.value)) };
};
