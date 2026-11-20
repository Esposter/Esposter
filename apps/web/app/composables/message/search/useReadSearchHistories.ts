import { requirePartitionKey } from "#src/services/message/requirePartitionKey";
import { useRoomStore } from "#src/store/message/room/index";
import { useSearchHistoryStore } from "#src/store/message/search/history";

export const useReadSearchHistories = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { readItems, readMoreItems, readSearchHistoryPage } = searchHistoryStore;
  const readSearchHistories = () =>
    readItems(async () => {
      const roomId = requirePartitionKey(currentRoomId.value, readSearchHistories.name);
      return readSearchHistoryPage(await $trpc.searchHistory.readSearchHistories.query({ roomId }));
    });
  const readMoreSearchHistories = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const roomId = requirePartitionKey(currentRoomId.value, readMoreSearchHistories.name);
      return readSearchHistoryPage(await $trpc.searchHistory.readSearchHistories.query({ cursor, roomId }));
    }, onComplete);
  return { readMoreSearchHistories, readSearchHistories };
};
