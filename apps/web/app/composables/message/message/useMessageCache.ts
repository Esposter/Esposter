import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

export const useMessageCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { getSlice } = dataStore;
  useCursorPaginationCache({
    configuration: MessageIndexedDbStoreConfiguration,
    getSlice,
    getWriteItems: (messages) => messages.filter((message) => !message.isLoading),
    partitionKey: currentRoomId,
  });
};
