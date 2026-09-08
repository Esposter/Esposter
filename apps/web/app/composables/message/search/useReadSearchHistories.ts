import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { useRoomStore } from "@/store/message/room";
import { useSearchHistoryStore } from "@/store/message/search/history";

export const useReadSearchHistories = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { readItems, readMoreItems } = searchHistoryStore;
  const readSearchHistories = () =>
    readItems(() => {
      const roomId = requirePartitionKey(currentRoomId.value, readSearchHistories.name);
      return $trpc.searchHistory.readSearchHistories.query({ roomId });
    });
  const readMoreSearchHistories = (onComplete: () => void) =>
    readMoreItems((cursor) => {
      const roomId = requirePartitionKey(currentRoomId.value, readMoreSearchHistories.name);
      return $trpc.searchHistory.readSearchHistories.query({ cursor, roomId });
    }, onComplete);
  return { readMoreSearchHistories, readSearchHistories };
};
