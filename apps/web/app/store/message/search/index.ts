import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { ClientMessage } from "@/models/message/ClientMessage";
import type { Filter, FilterType } from "@esposter/db-schema";

import { checkIsSearchQueryEmpty } from "#shared/services/message/checkIsSearchQueryEmpty";
import { useRoomStore } from "@/store/message/room";

// The search a room's results were read for, held beside them so a continuation is read for that search
type ResultSearch = Pick<SearchMessagesInput, "filters" | "query">;

export const useSearchMessageStore = defineStore("message/search", () => {
  const roomStore = useRoomStore();
  const { data: searchQuery } = useDataMap(() => roomStore.currentRoomId, "");
  const isMenuOpen = ref(false);
  const { data: selectedFilters } = useDataMap<Filter[]>(() => roomStore.currentRoomId, []);
  // The chip a picker is currently filling in. Only ever the last one, because a filter is added by typing its
  // Keyword and immediately needs its value, and the picker writes onto the filter itself rather than replacing it
  const activeSelectedFilter = computed(() => selectedFilters.value.at(-1));
  const isSearchQueryEmpty = computed(() => checkIsSearchQueryEmpty(searchQuery.value, selectedFilters.value));
  const createFilter = (type: FilterType) => {
    selectedFilters.value.push({ type, value: "" });
  };
  // Keyed by room like the rows it pages, so a search's results are filed under the room it was issued for
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<ClientMessage>(() => roomStore.currentRoomId);
  // The totals a search writes back belong to the room it was issued for, so a read binds them alongside the
  // Result slice it is already binding — `count` itself tracks whichever room is current, which is what the rendered
  // Header wants and exactly what an in-flight response must not use
  const { data: count, getBoundData: getBoundCount } = useDataMap(() => roomStore.currentRoomId, 0);
  const { getBoundData: getBoundResultSearch, getDataRef: getResultSearchRef } = useDataMap<ResultSearch | undefined>(
    () => roomStore.currentRoomId,
    undefined,
  );
  // Pending belongs to the room the search was issued for, like the totals above it: held globally, a search
  // Still running in the room the reader just left renders the room they arrived in as loading, and the first
  // Of two overlapping searches to finish clears the flag for both
  const { data: isSearching, getBoundData: getBoundIsSearching } = useDataMap(() => roomStore.currentRoomId, false);
  // A room's newest search cancels the one still in flight for it, from whichever surface issued it, so the response
  // To an earlier search never lands over the results of the search that replaced it
  const searchAbortControllerMap = new Map<string, AbortController>();
  const beginSearch = (roomId: string) => {
    searchAbortControllerMap.get(roomId)?.abort();
    const searchAbortController = new AbortController();
    searchAbortControllerMap.set(roomId, searchAbortController);
    return searchAbortController.signal;
  };
  return {
    activeSelectedFilter,
    beginSearch,
    count,
    createFilter,
    getBoundCount,
    getBoundIsSearching,
    getBoundResultSearch,
    getResultSearchRef,
    getSlice,
    isMenuOpen,
    isSearching,
    isSearchQueryEmpty,
    items,
    searchQuery,
    selectedFilters,
    ...restData,
  };
});
