/* eslint-disable perfectionist/sort-switch-case */
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Filter } from "#shared/models/message/Filter";

import { MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadata";
import { FilterType } from "#shared/models/message/FilterType";
import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";

export const useSearchMessageStore = defineStore("message/searchMessage", () => {
  const roomStore = useRoomStore();
  const { data: searchQuery } = useDataMap<string>(() => roomStore.currentRoomId, "");
  const menu = ref(false);
  const isSearching = ref(false);
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
    let key = "";

    switch (type) {
      case FilterType.From:
        key = MessageEntityPropertyNames.userId;
        break;
      case FilterType.Mentions:
        key = MessageEntityPropertyNames.mentions;
        break;
      case FilterType.Before:
      case FilterType.During:
      case FilterType.After:
        key = ItemMetadataPropertyNames.createdAt;
        break;
      case FilterType.Pinned:
        key = MessageEntityPropertyNames.isPinned;
        break;
    }

    selectedFilters.value.push({ key, type, value: "" });
  };
  const deleteFilter = (index: number) => {
    if (index >= 0 && index < selectedFilters.value.length) selectedFilters.value.splice(index, 1);
  };
  const clearFilters = () => {
    selectedFilters.value = [];
  };
  const hasFilters = computed(() => selectedFilters.value.length > 0);
  const { items, ...rest } = useOffsetPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const { data: totalItemsLength } = useDataMap<number>(() => roomStore.currentRoomId, 0);
  const pageCount = computed(() => Math.ceil(totalItemsLength.value / DEFAULT_READ_LIMIT));
  const page = ref(1);
  return {
    activeSelectedFilter,
    clearFilters,
    createFilter,
    deleteFilter,
    hasFilters,
    isSearching,
    isSearchQueryEmpty,
    items,
    menu,
    page,
    pageCount,
    searchQuery,
    selectedFilters,
    totalItemsLength,
    ...rest,
  };
});
