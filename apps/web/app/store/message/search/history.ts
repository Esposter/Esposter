import type { CreateSearchHistoryInput } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import type { SearchHistoryInMessage } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { createOperationData } from "#src/services/shared/createOperationData";
import { useRoomStore } from "#src/store/message/room/index";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useSearchHistoryStore = defineStore("message/search/history", () => {
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<SearchHistoryInMessage>(
    () => roomStore.currentRoomId,
  );
  // `items` is the reading view — whichever room is open. A write names the room it is for when it is issued, so
  // A row created for one room is never filed under the room the reader has switched to
  const getRoomOperationData = (roomId: string) =>
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.SearchHistory);
  const { $trpc } = useNuxtApp();

  const { executeMutation: executeCreateSearchHistoryMutation } = useMutation();
  const createSearchHistory = async (input: CreateSearchHistoryInput) => {
    const { createSearchHistory: baseCreateSearchHistory } = getRoomOperationData(input.roomId);
    await executeCreateSearchHistoryMutation(() => $trpc.searchHistory.createSearchHistory.mutate(input), {
      // The entry's id is the server's to mint, so the entry is drawn once the server answers with it
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: Symbol("createSearchHistory"),
      onSuccess: (newSearchHistory) => {
        baseCreateSearchHistory(newSearchHistory);
      },
    });
  };

  return { createSearchHistory, getSlice, items, ...restData };
});
