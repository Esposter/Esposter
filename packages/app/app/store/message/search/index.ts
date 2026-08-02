import type { Filter, MessageEntity } from "@esposter/db-schema";

import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";
import { FilterType } from "@esposter/db-schema";

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
      if (!value) return;
      selectedFilters.value[selectedFilters.value.length - 1] = value;
    },
  });
  const isSearchQueryEmpty = computed(() => getIsSearchQueryEmpty(searchQuery.value, selectedFilters.value));
  const createFilter = (type: FilterType) => {
    selectedFilters.value.push({ type, value: "" });
  };
  const deleteFilter = (index: number) => {
    if (index >= 0 && index < selectedFilters.value.length) selectedFilters.value.splice(index, 1);
  };
  const clearFilters = () => {
    selectedFilters.value = [];
  };
  const hasFilters = computed(() => selectedFilters.value.length > 0);
  const { items, ...restData } = useOffsetPaginationDataMap<MessageEntity>(() => searchResultId.value);
  const { data: count } = useDataMap(() => searchResultId.value, 0);
  const pageCount = computed(() => Math.ceil(count.value / DEFAULT_READ_LIMIT));
  const { data: page } = useDataMap(() => searchResultId.value, 1);
  return {
    activeSelectedFilter,
    clearFilters,
    count,
    createFilter,
    deleteFilter,
    hasFiles,
    hasFilters,
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
