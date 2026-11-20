import { RoomIndexedDbStoreConfiguration } from "#src/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { useRoomStore } from "#src/store/message/room/index";

export const useRoomCache = () => {
  const userId = useSessionUserId();
  const roomStore = useRoomStore();
  const { getSlice } = roomStore;
  usePaginationCache({
    configuration: RoomIndexedDbStoreConfiguration,
    // One list rather than a map — the user's own rooms — so its slice takes no partition to resolve, and the
    // Cache hands one it ignores
    getSlice,
    partitionKey: () => userId.value,
  });
};
