import type { Room } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { authClient } from "@/services/auth/authClient";
import { RoomCacheStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomCacheStoreConfiguration";
import { readCached } from "@/services/cache/indexedDb/readCached";
import { writeCached } from "@/services/cache/indexedDb/writeCached";
import { useRoomStore } from "@/store/message/room";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const online = useOnline();
  const session = authClient.useSession();
  const readUserToRooms = useReadUserToRooms();
  const readMyPermissions = useReadMyPermissions();
  const readRoles = useReadRoles();
  const readRooms = () =>
    readItems(
      async () => {
        const userId = session.value.data?.user.id;
        if (!online.value && userId) {
          const cachedEntries = await readCached<Room & { partitionKey: string }>(RoomCacheStoreConfiguration, userId);
          const cachedData = new CursorPaginationData<Room>();
          cachedData.items = cachedEntries.map(({ partitionKey: _partitionKey, ...room }) => room as Room);
          return cachedData;
        }
        const result = await $trpc.room.readRooms.query({ roomId: currentRoomId.value });
        if (userId) {
          await writeCached(
            RoomCacheStoreConfiguration,
            result.items.map((room) => ({ ...room, partitionKey: userId })),
            userId,
          );
        }
        return result;
      },
      async ({ items }) => {
        const roomIds = items.map(({ id }) => id);
        if (roomIds.length === 0) return;
        await Promise.all([readUserToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      },
    );
  const readMoreRooms = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const response = await $trpc.room.readRooms.query({ cursor });
      const roomIds = response.items.map(({ id }) => id);
      if (roomIds.length === 0) return response;
      await Promise.all([readUserToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      return response;
    }, onComplete);
  return { readMoreRooms, readRooms };
};
