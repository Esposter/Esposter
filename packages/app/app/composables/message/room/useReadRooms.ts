import { authClient } from "@/services/auth/authClient";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useRoomStore } from "@/store/message/room";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const session = authClient.useSession();
  const readUserToRooms = useReadUserToRooms();
  const readMyPermissions = useReadMyPermissions();
  const readRoles = useReadRoles();
  const readRooms = () =>
    readItems(
      () => $trpc.room.readRooms.query({ roomId: currentRoomId.value }),
      async ({ items }) => {
        const roomIds = items.map(({ id }) => id);
        if (roomIds.length === 0) return;
        await Promise.all([readUserToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      },
      {
        cache: {
          read: (partitionKey) => readIndexedDb(RoomIndexedDbStoreConfiguration, partitionKey),
          write: (items, partitionKey) => writeIndexedDb(RoomIndexedDbStoreConfiguration, items, partitionKey),
        },
        partitionKey: session.value.data?.user.id ?? "",
      },
    );
  const readMoreRooms = (onComplete: () => void) =>
    readMoreItems(
      async (cursor) => {
        const response = await $trpc.room.readRooms.query({ cursor });
        const roomIds = response.items.map(({ id }) => id);
        if (roomIds.length === 0) return response;
        await Promise.all([readUserToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
        return response;
      },
      onComplete,
      {
        cache: {
          read: (partitionKey) => readIndexedDb(RoomIndexedDbStoreConfiguration, partitionKey),
          write: (items, partitionKey) => writeIndexedDb(RoomIndexedDbStoreConfiguration, items, partitionKey),
        },
        partitionKey: session.value.data?.user.id ?? "",
      },
    );
  return { readMoreRooms, readRooms };
};
