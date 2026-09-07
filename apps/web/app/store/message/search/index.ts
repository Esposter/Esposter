import type { Filter, FilterType, MessageEntity } from "@esposter/db-schema";

import { checkIsSearchQueryEmpty } from "#shared/services/message/checkIsSearchQueryEmpty";
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";

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
  const { items, ...restData } = useOffsetPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  // The totals a search writes back belong to the room it was issued for, so a read binds them alongside the
  // Result slice it is already binding — `count`/`page` themselves track whichever room is current, which is
  // What the rendered header and paginator want and exactly what an in-flight response must not use
  const { data: count, getBoundData: getBoundCount } = useDataMap(() => roomStore.currentRoomId, 0);
  const pageCount = computed(() => Math.ceil(count.value / DEFAULT_READ_LIMIT));
  const { data: page, getBoundData: getBoundPage } = useDataMap(() => roomStore.currentRoomId, 1);
  // Pending belongs to the room the search was issued for, like the totals above it: held globally, a search
  // Still running in the room the reader just left renders the room they arrived in as loading, and the first
  // Of two overlapping searches to finish clears the flag for both
  const { data: isSearching, getBoundData: getBoundIsSearching } = useDataMap(() => roomStore.currentRoomId, false);
  return {
    activeSelectedFilter,
    count,
    createFilter,
    getBoundCount,
    getBoundIsSearching,
    getBoundPage,
    isMenuOpen,
    isSearching,
    isSearchQueryEmpty,
    items,
    page,
    pageCount,
    searchQuery,
    selectedFilters,
    ...restData,
  };
});
