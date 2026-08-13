import type { Filter, FilterType, MessageEntity } from "@esposter/db-schema";

import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";

export const useSearchMessageStore = defineStore("message/search", () => {
  const roomStore = useRoomStore();
  const { data: searchQuery } = useDataMap(() => roomStore.currentRoomId, "");
  const menu = ref(false);
  const isSearching = ref(false);
  // Files-in-room tab mode — lists every message with an attachment instead of a text/filter search.
  // Keyed per room like its query/filter siblings, so switching rooms never carries the previous room's
  // Tab (and its attachment browse) into the new one.
  const { data: hasFiles } = useDataMap(() => roomStore.currentRoomId, false);
  // Each tab owns its own result slice, so the rendered results can never belong to the other tab: leaving
  // The Files tab hands back the Search tab's own (empty until searched) results instead of the attachment
  // Browse, and paging them can never re-issue that browse's query with hasFiles false.
  const searchResultId = computed(() =>
    roomStore.currentRoomId ? `${roomStore.currentRoomId}-${hasFiles.value}` : "",
  );
  const { data: selectedFilters } = useDataMap<Filter[]>(() => roomStore.currentRoomId, []);
  const activeSelectedFilter = computed({
    get: () => selectedFilters.value.at(-1),
    set: (value) => {
      const lastIndex = selectedFilters.value.length - 1;
      if (!value || lastIndex === -1) return;
      selectedFilters.value[lastIndex] = value;
    },
  });
  const isSearchQueryEmpty = computed(() => getIsSearchQueryEmpty(searchQuery.value, selectedFilters.value));
  const createFilter = (type: FilterType) => {
    selectedFilters.value.push({ type, value: "" });
  };
  const { items, ...restData } = useOffsetPaginationDataMap<MessageEntity>(() => searchResultId.value);
  // The totals a search writes back belong to the tab it was issued for, so a read binds them alongside the
  // Result slice it is already binding — `count`/`page` themselves track whichever tab is current, which is
  // What the rendered header and paginator want and exactly what an in-flight response must not use
  const { data: count, getBoundData: getBoundCount } = useDataMap(() => searchResultId.value, 0);
  const pageCount = computed(() => Math.ceil(count.value / DEFAULT_READ_LIMIT));
  const { data: page, getBoundData: getBoundPage } = useDataMap(() => searchResultId.value, 1);
  return {
    activeSelectedFilter,
    count,
    createFilter,
    getBoundCount,
    getBoundPage,
    hasFiles,
    isSearching,
    isSearchQueryEmpty,
    items,
    menu,
    page,
    pageCount,
    searchQuery,
    selectedFilters,
    ...restData,
  };
});
