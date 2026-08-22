import { authClient } from "@/services/auth/authClient";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { useRoomStore } from "@/store/message/room";

export const useRoomCache = () => {
  const session = authClient.useSession();
  const roomStore = useRoomStore();
  const { getSlice } = roomStore;
  useCursorPaginationCache({
    configuration: RoomIndexedDbStoreConfiguration,
    // One list rather than a map — the user's own rooms — so its slice takes no partition to resolve, and the
    // Cache hands one it ignores
    getSlice,
    partitionKey: () => session.value.data?.user.id ?? "",
  });
};
