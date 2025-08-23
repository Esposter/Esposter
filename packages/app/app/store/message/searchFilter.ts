import type { FilterType } from "#shared/models/message/FilterType";
import type { Filter } from "@@/server/models/message/Filter";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/message/room";

export const useSearchFilterStore = defineStore("message/searchFilter", () => {
  const roomStore = useRoomStore();
  const { data: selectedFilters } = createDataMap<Filter[]>(() => roomStore.currentRoomId, []);
  const createFilter = (type: FilterType) => {
    selectedFilters.value.push({ type, value: "" });
  };
  const deleteFilter = (index: number) => {
    if (index >= 0 && index < selectedFilters.value.length) {
      selectedFilters.value.splice(index, 1);
    }
  };
  const clearFilters = () => {
    selectedFilters.value = [];
  };
  const hasFilters = computed(() => selectedFilters.value.length > 0);
  return {
    clearFilters,
    createFilter,
    deleteFilter,
    hasFilters,
    selectedFilters,
  };
});
