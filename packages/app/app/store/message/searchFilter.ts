import type { Filter } from "@@/server/models/message/Filter";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/message/room";

export const useSearchFilterStore = defineStore("message/searchFilter", () => {
  const roomStore = useRoomStore();
  const { data: selectedFilters } = createDataMap<Filter[]>(() => roomStore.currentRoomId, []);
  const createFilter = (filter: Filter) => {
    selectedFilters.value.push(filter);
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
