import type { RoomInMessage } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { authClient } from "@/services/auth/authClient";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
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
  const online = useOnline();
  const readRooms = () => {
    const userId = session.value?.user.id;
    if (!userId)
      throw new InvalidOperationError(Operation.Read, readRooms.name, CompositeKeyPropertyNames.partitionKey);
    return readItems(
      async () => {
        if (!online.value) {
          const cachedData = new CursorPaginationData<RoomInMessage>();
          cachedData.items = await readIndexedDb(RoomIndexedDbStoreConfiguration, userId);
          return cachedData;
        }

        return $trpc.room.readRooms.query({ roomId: currentRoomId.value });
      },
      async ({ items }) => {
        if (!online.value) return;
        const roomIds = items.map(({ id }) => id);
        if (roomIds.length === 0) return;
        await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      },
    );
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
