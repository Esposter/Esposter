import type { CreateSearchHistoryInput } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import type { DeleteSearchHistoryInput } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import type { UpdateSearchHistoryInput } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";
import type { SearchHistoryInMessage } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useSearchHistoryStore = defineStore("message/search/history", () => {
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<SearchHistoryInMessage>(
    () => roomStore.currentRoomId,
  );
  // `items` is the reading view — whichever room is open. A write names the room it is for when it is issued, so
  // A row created, renamed or removed for one room is never filed under the room the reader has switched to
  const getRoomOperationData = (roomId: string) =>
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.SearchHistory);
  const { $trpc } = useNuxtApp();

  const { executeMutation: executeCreateSearchHistoryMutation } = useMutation();
  const { executeMutation: executeUpdateSearchHistoryMutation } = useMutation();
  const { executeMutation: executeDeleteSearchHistoryMutation } = useMutation();
  const createSearchHistory = async (input: CreateSearchHistoryInput) => {
    const { createSearchHistory: baseCreateSearchHistory } = getRoomOperationData(input.roomId);
    await executeCreateSearchHistoryMutation(() => $trpc.searchHistory.createSearchHistory.mutate(input), {
      key: Symbol("createSearchHistory"),
      onSuccess: (newHistory) => {
        baseCreateSearchHistory(newHistory);
      },
    });
  };
  // The row being edited is one the reader is looking at, so the room it belongs to is the room open right now —
  // Resolved here rather than in the callbacks, which run once the write has been out to the server and back
  const updateSearchHistory = async (input: UpdateSearchHistoryInput) => {
    const { items: roomItems } = getSlice(roomStore.currentRoomId);
    const { updateSearchHistory: baseUpdateSearchHistory } = getRoomOperationData(roomStore.currentRoomId);
    await executeUpdateSearchHistoryMutation(() => $trpc.searchHistory.updateSearchHistory.mutate(input), {
      // Only the fields this write overwrites, on the one row it touches, and read as the write is sent — rows
      // Are keyed per history entry and never queue against each other
      applyOptimistic: () => {
        const previousSearchHistory = roomItems.value.find(({ id }) => id === input.id);
        const rollbackSearchHistory = previousSearchHistory && { ...previousSearchHistory };
        baseUpdateSearchHistory(input);
        return () => {
          if (rollbackSearchHistory) baseUpdateSearchHistory(rollbackSearchHistory);
        };
      },
      key: input.id,
      onSuccess: (updated) => {
        baseUpdateSearchHistory(updated);
      },
    });
  };
  const deleteSearchHistory = async (input: DeleteSearchHistoryInput) => {
    const { items: roomItems } = getSlice(roomStore.currentRoomId);
    const { createSearchHistory: baseCreateSearchHistory, deleteSearchHistory: baseDeleteSearchHistory } =
      getRoomOperationData(roomStore.currentRoomId);
    await executeDeleteSearchHistoryMutation(() => $trpc.searchHistory.deleteSearchHistory.mutate(input), {
      // Only the one row this write removes — see `updateSearchHistory`. It comes back at the end of the list
      // Rather than where it stood, a cosmetic loss taken over dropping a row
      applyOptimistic: () => {
        const deletedSearchHistory = roomItems.value.find(({ id }) => id === input);
        baseDeleteSearchHistory({ id: input });
        return () => {
          if (deletedSearchHistory) baseCreateSearchHistory(deletedSearchHistory);
        };
      },
      key: input,
    });
  };

  return {
    createSearchHistory,
    deleteSearchHistory,
    getSlice,
    items,
    updateSearchHistory,
    ...restData,
  };
});
