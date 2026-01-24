import type { CreateSearchHistoryInput } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import type { DeleteSearchHistoryInput } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import type { UpdateSearchHistoryInput } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";
import type { SearchHistoryInMessage } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useSearchHistoryStore = defineStore("message/searchHistory", () => {
  const roomStore = useRoomStore();
  const { items, ...restData } = useCursorPaginationDataMap<SearchHistoryInMessage>(() => roomStore.currentRoomId);
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
    const updated = await $trpc.searchHistory.updateSearchHistory.mutate(input);
    baseUpdateSearchHistory(updated);
  };
  const deleteSearchHistory = async (input: DeleteSearchHistoryInput) => {
    const { id } = await $trpc.searchHistory.deleteSearchHistory.mutate(input);
    baseDeleteSearchHistory({ id });
  };

  return {
    createSearchHistory,
    deleteSearchHistory,
    items,
    updateSearchHistory,
    ...restOperationData,
    ...restData,
  };
});
