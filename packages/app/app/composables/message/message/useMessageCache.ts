import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

export const useMessageCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  const { initializeCursorPaginationData } = dataStore;
  return useCursorPaginationCache({
    configuration: MessageIndexedDbStoreConfiguration,
    getWriteItems: (messages) => messages.filter((message) => !message.isLoading),
    initializeCursorPaginationData,
    items,
    partitionKey: currentRoomId,
  });
};
