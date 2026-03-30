import { useRoomStore } from "@/store/message/room";
import { useSearchHistoryStore } from "@/store/message/searchHistory";
import { StandardMessageEntityPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadSearchHistories = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { readItems, readMoreItems } = searchHistoryStore;
  const readSearchHistories = () =>
    readItems(() => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(
          Operation.Read,
          readSearchHistories.name,
          StandardMessageEntityPropertyNames.partitionKey,
        );
      return $trpc.searchHistory.readSearchHistories.query({ roomId: currentRoomId.value });
    });
  const readMoreSearchHistories = (onComplete: () => void) =>
    readMoreItems((cursor) => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(
          Operation.Read,
          readSearchHistories.name,
          StandardMessageEntityPropertyNames.partitionKey,
        );
      return $trpc.searchHistory.readSearchHistories.query({ cursor, roomId: currentRoomId.value });
    }, onComplete);
  return { readMoreSearchHistories, readSearchHistories };
};
