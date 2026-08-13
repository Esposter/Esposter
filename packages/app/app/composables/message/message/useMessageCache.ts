import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

export const useMessageCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { isLoaded, items } = storeToRefs(dataStore);
  const { initializeCursorPaginationData } = dataStore;
  useCursorPaginationCache({
    configuration: MessageIndexedDbStoreConfiguration,
    getWriteItems: (messages) => messages.filter((message) => !message.isLoading),
    // Unbound on purpose: usePaginationCache re-checks the partition key after its IndexedDB read and bails when
    // The room has moved on, so the callback only ever runs while the key it hydrated for is still current
    initializeCursorPaginationData,
    isLoaded,
    items,
    partitionKey: currentRoomId,
  });
};
