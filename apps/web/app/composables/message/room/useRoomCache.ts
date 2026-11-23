import { RoomIndexedDbStoreConfiguration } from "#src/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { UserToRoomIndexedDbStoreConfiguration } from "#src/services/cache/indexedDb/configurations/UserToRoomIndexedDbStoreConfiguration";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";

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
  // The rooms show only with their memberships, so the viewer's memberships are cached beside them and restored at
  // Their versions
  const userToRoomStore = useUserToRoomStore();
  const { getSlice: getUserToRoomSlice } = userToRoomStore;
  usePaginationCache({
    configuration: UserToRoomIndexedDbStoreConfiguration,
    getSlice: getUserToRoomSlice,
    partitionKey: () => userId.value,
  });
};
