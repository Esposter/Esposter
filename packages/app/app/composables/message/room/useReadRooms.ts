import { authClient } from "@/services/auth/authClient";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { useRoomStore } from "@/store/message/room";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const session = authClient.useSession();
  const readUserToRooms = useReadUserToRooms();
  const readMyPermissions = useReadMyPermissions();
  const readRoles = useReadRoles();
  const readRooms = () => {
    const userId = session.value.data?.user.id;
    if (!userId)
      throw new InvalidOperationError(Operation.Read, readRooms.name, CompositeKeyPropertyNames.partitionKey);
    return readItems(
      async () => {
        return $trpc.room.readRooms.query({ roomId: currentRoomId.value });
      },
      async ({ items }) => {
        const roomIds = items.map(({ id }) => id);
        if (roomIds.length === 0) return;
        await Promise.all([readUserToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      },
      {
        configuration: RoomIndexedDbStoreConfiguration,
        partitionKey: userId,
      },
    );
  };
  const readMoreRooms = (onComplete: () => void) => {
    const userId = session.value.data?.user.id;
    if (!userId)
      throw new InvalidOperationError(Operation.Read, readMoreRooms.name, CompositeKeyPropertyNames.partitionKey);
    return readMoreItems(
      async (cursor) => {
        const response = await $trpc.room.readRooms.query({ cursor });
        const roomIds = response.items.map(({ id }) => id);
        if (roomIds.length === 0) return response;
        await Promise.all([readUserToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
        return response;
      },
      onComplete,
      {
        configuration: RoomIndexedDbStoreConfiguration,
        partitionKey: userId,
      },
    );
  };
  return { readMoreRooms, readRooms };
};
