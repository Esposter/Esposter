import { authClient } from "@/services/auth/authClient";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { useRoomStore } from "@/store/message/room";

export const useRoomCache = () => {
  const session = authClient.useSession();
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const { initializeCursorPaginationData } = roomStore;
  useCursorPaginationCache({
    configuration: RoomIndexedDbStoreConfiguration,
    initializeCursorPaginationData,
    items: rooms,
    partitionKey: () => session.value.data?.user.id ?? "",
  });
};
