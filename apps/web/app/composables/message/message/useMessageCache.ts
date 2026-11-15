import { MessageIndexedDbStoreConfiguration } from "#src/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { useDataStore } from "#src/store/message/data";
import { useRoomStore } from "#src/store/message/room/index";

export const useMessageCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { getSlice } = dataStore;
  usePaginationCache({
    configuration: MessageIndexedDbStoreConfiguration,
    getSlice,
    getWriteItems: (messages) => messages.filter((message) => !message.isLoading),
    partitionKey: currentRoomId,
  });
};
