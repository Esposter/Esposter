import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Filter } from "#shared/models/message/Filter";
import type { FilterType } from "#shared/models/message/FilterType";

import { createDataMap } from "@/services/shared/createDataMap";
import { createOffsetPaginationDataMap } from "@/services/shared/pagination/offset/createOffsetPaginationDataMap";
import { useRoomStore } from "@/store/message/room";

export const useSearchMessageStore = defineStore("message/searchMessage", () => {
  const roomStore = useRoomStore();
  const { data: selectedFilters } = createDataMap<Filter[]>(() => roomStore.currentRoomId, []);
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
  const { items: messages, ...rest } = createOffsetPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  return {
    clearFilters,
    createFilter,
    deleteFilter,
    hasFilters,
    messages,
    selectedFilters,
    ...rest,
  };
});
