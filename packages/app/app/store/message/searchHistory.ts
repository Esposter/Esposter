import type { SearchHistory } from "#shared/db/schema/searchHistories";
import type { CreateSearchHistoryInput } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import type { DeleteSearchHistoryInput } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import type { UpdateSearchHistoryInput } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useRoomStore } from "@/store/message/room";

export const useSearchHistoryStore = defineStore("message/searchHistory", () => {
  const roomStore = useRoomStore();
  const { items, ...restData } = createCursorPaginationDataMap<SearchHistory>(() => roomStore.currentRoomId);
  const {
    createSearchHistory: baseCreateSearchHistory,
    deleteSearchHistory: baseDeleteSearchHistory,
    updateSearchHistory: baseUpdateSearchHistory,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.SearchHistory);
  const { $trpc } = useNuxtApp();

  const createSearchHistory = async (input: CreateSearchHistoryInput) => {
    const newHistory = await $trpc.searchHistory.createSearchHistory.mutate(input);
    baseCreateSearchHistory(newHistory);
  };
  const updateSearchHistory = async (input: UpdateSearchHistoryInput) => {
    const updatedHistory = await $trpc.searchHistory.updateSearchHistory.mutate(input);
    baseUpdateSearchHistory(updatedHistory);
  };
  const deleteSearchHistory = async (id: DeleteSearchHistoryInput) => {
    const deletedHistory = await $trpc.searchHistory.deleteSearchHistory.mutate(id);
    baseDeleteSearchHistory({ id: deletedHistory.id });
  };

  return {
    createSearchHistory,
    deleteSearchHistory,
    updateSearchHistory,
    ...restOperationData,
    ...restData,
  };
});
