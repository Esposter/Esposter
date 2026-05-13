import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

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
    const userId = session.value?.user.id;
    if (!userId)
      throw new InvalidOperationError(Operation.Read, readRooms.name, CompositeKeyPropertyNames.partitionKey);
    return readItems(async () => {
      const data = await $trpc.room.readRooms.query({ roomId: currentRoomId.value });
      const roomIds = data.items.map(({ id }) => id);
      if (roomIds.length > 0)
        await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      return data;
    });
  };
  const readMoreRooms = (onComplete: () => void) => {
    const userId = session.value?.user.id;
    if (!userId)
      throw new InvalidOperationError(Operation.Read, readMoreRooms.name, CompositeKeyPropertyNames.partitionKey);
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
