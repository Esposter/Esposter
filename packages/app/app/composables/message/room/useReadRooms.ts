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
      const data = await $trpc.room.readRooms.query(currentRoomId.value ? { roomId: currentRoomId.value } : {});
      const roomIds = data.items.map(({ id }) => id);
      if (roomIds.length > 0)
        await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      return data;
    });
  };
  const readMoreRooms = (onComplete: () => void) => {
    requirePartitionKey(session.value?.user.id, readMoreRooms.name);
    return readMoreItems(async (cursor) => {
      const response = await $trpc.room.readRooms.query({ cursor });
      const roomIds = response.items.map(({ id }) => id);
      if (roomIds.length === 0) return response;
      await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      return response;
    }, onComplete);
  };
  return { readMoreRooms, readRooms };
};
