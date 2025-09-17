import { MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { useRoomStore } from "@/store/message/room";
import { useSearchHistoryStore } from "@/store/message/searchHistory";
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
          MessageEntityPropertyNames.partitionKey,
        );
      return $trpc.searchHistory.readSearchHistories.useQuery({ roomId: currentRoomId.value });
    });
  const readMoreSearchHistories = () =>
    readMoreItems((cursor) => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(
          Operation.Read,
          readSearchHistories.name,
          MessageEntityPropertyNames.partitionKey,
        );
      return $trpc.searchHistory.readSearchHistories.query({ cursor, roomId: currentRoomId.value });
    });
  return { readMoreSearchHistories, readSearchHistories };
};
