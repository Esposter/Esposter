import type { CreateSearchHistoryInput } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import type { DeleteSearchHistoryInput } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import type { UpdateSearchHistoryInput } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";
import type { SearchHistoryInMessage } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useSearchHistoryStore = defineStore("message/search/history", () => {
  const roomStore = useRoomStore();
  const { items, ...restData } = useCursorPaginationDataMap<SearchHistoryInMessage>(() => roomStore.currentRoomId);
  const {
    createSearchHistory: baseCreateSearchHistory,
    deleteSearchHistory: baseDeleteSearchHistory,
    updateSearchHistory: baseUpdateSearchHistory,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.SearchHistory);
  const { $trpc } = useNuxtApp();

  const executeCreateSearchHistoryMutation = useMutation();
  const executeUpdateSearchHistoryMutation = useMutation();
  const executeDeleteSearchHistoryMutation = useMutation();
  // Server-generated history row — non-optimistic, applied in onSuccess
  const createSearchHistory = async (input: CreateSearchHistoryInput) => {
    await executeCreateSearchHistoryMutation(() => $trpc.searchHistory.createSearchHistory.mutate(input), {
      onSuccess: (newHistory) => {
        baseCreateSearchHistory(newHistory);
      },
    });
  };
  const updateSearchHistory = async (input: UpdateSearchHistoryInput) => {
    const snapshot = items.value.map((searchHistory) => ({ ...searchHistory }));
    await executeUpdateSearchHistoryMutation(() => $trpc.searchHistory.updateSearchHistory.mutate(input), {
      applyOptimistic: () => {
        baseUpdateSearchHistory(input);
        return () => {
          items.value = snapshot;
        };
      },
      onSuccess: (updated) => {
        baseUpdateSearchHistory(updated);
      },
    });
  };
  const deleteSearchHistory = async (input: DeleteSearchHistoryInput) => {
    const snapshot = [...items.value];
    await executeDeleteSearchHistoryMutation(() => $trpc.searchHistory.deleteSearchHistory.mutate(input), {
      applyOptimistic: () => {
        baseDeleteSearchHistory({ id: input });
        return () => {
          items.value = snapshot;
        };
      },
    });
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
