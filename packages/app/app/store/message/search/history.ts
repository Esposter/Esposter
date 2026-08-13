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

  const { executeMutation: executeCreateSearchHistoryMutation } = useMutation();
  const { executeMutation: executeUpdateSearchHistoryMutation } = useMutation();
  const { executeMutation: executeDeleteSearchHistoryMutation } = useMutation();
  // Server-generated history row — non-optimistic, applied in onSuccess. Creates have no natural entity
  // Key, so each call gets a unique one — rapid successive searches must all land, never queue behind each other
  const createSearchHistory = async (input: CreateSearchHistoryInput) => {
    await executeCreateSearchHistoryMutation(() => $trpc.searchHistory.createSearchHistory.mutate(input), {
      key: Symbol("createSearchHistory"),
      onSuccess: (newHistory) => {
        baseCreateSearchHistory(newHistory);
      },
    });
  };
  const updateSearchHistory = async (input: UpdateSearchHistoryInput) => {
    await executeUpdateSearchHistoryMutation(() => $trpc.searchHistory.updateSearchHistory.mutate(input), {
      // Only the fields this write overwrites, on the one row it touches, and read as the write is sent: rows are
      // Keyed per history entry and never queue against each other, so reinstating the list would undo another
      // Row's edit or deletion and drop whatever the list gained while this write was in flight
      applyOptimistic: () => {
        const previousSearchHistory = items.value.find(({ id }) => id === input.id);
        const rollbackSearchHistory = previousSearchHistory && { ...previousSearchHistory };
        baseUpdateSearchHistory(input);
        return () => {
          if (rollbackSearchHistory) baseUpdateSearchHistory(rollbackSearchHistory);
        };
      },
      // Keyed per history row so concurrent operations on different rows run independently instead of queueing behind each other
      key: input.id,
      onSuccess: (updated) => {
        baseUpdateSearchHistory(updated);
      },
    });
  };
  const deleteSearchHistory = async (input: DeleteSearchHistoryInput) => {
    await executeDeleteSearchHistoryMutation(() => $trpc.searchHistory.deleteSearchHistory.mutate(input), {
      // Only the one row this write removes — see `updateSearchHistory`. It comes back at the end of the list
      // Rather than where it stood, a cosmetic loss taken over dropping a row
      applyOptimistic: () => {
        const deletedSearchHistory = items.value.find(({ id }) => id === input);
        baseDeleteSearchHistory({ id: input });
        return () => {
          if (deletedSearchHistory) baseCreateSearchHistory(deletedSearchHistory);
        };
      },
      // Keyed per history row so concurrent operations on different rows run independently instead of queueing behind each other
      key: input,
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
