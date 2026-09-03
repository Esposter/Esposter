import { authClient } from "@/services/auth/authClient";
import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { useRoomStore } from "@/store/message/room";

export const useReadRooms = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const { data: session } = await authClient.useSession(useFetch);
  const readMyUsersToRooms = useReadMyUsersToRooms();
  const readMyPermissions = useReadMyPermissions();
  const readRoles = useReadRoles();
  const readRooms = () => {
    requirePartitionKey(session.value?.user.id, readRooms.name);
    return readItems(async () => {
      const cursorPaginationData = await $trpc.room.readRooms.query(
        currentRoomId.value ? { roomId: currentRoomId.value } : {},
      );
      const roomIds = cursorPaginationData.items.map(({ id }) => id);
      if (roomIds.length > 0)
        await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      return cursorPaginationData;
    });
  };
  const readMoreRooms = (onComplete: () => void) => {
    requirePartitionKey(session.value?.user.id, readMoreRooms.name);
    return readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.room.readRooms.query({ cursor });
      const roomIds = cursorPaginationData.items.map(({ id }) => id);
      if (roomIds.length === 0) return cursorPaginationData;
      await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      return cursorPaginationData;
    }, onComplete);
  };
  return { readMoreRooms, readRooms };
};
