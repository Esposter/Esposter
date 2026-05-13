import type { RoomInMessage } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { authClient } from "@/services/auth/authClient";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useRoomStore } from "@/store/message/room";
import { getResultAsync, noop } from "@esposter/shared";

export const useRoomCache = () => {
  const session = authClient.useSession();
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const { initializeCursorPaginationData } = roomStore;
  const online = useOnline();
  let pendingOperation: Promise<void> = Promise.resolve();

  watchDeep(rooms, (newRooms) => {
    const userId = session.value.data?.user.id;
    if (!userId || newRooms.length === 0) return;
    const previousOperation = pendingOperation;
    pendingOperation = getResultAsync(async () => {
      await previousOperation;
      await writeIndexedDb(RoomIndexedDbStoreConfiguration, newRooms, userId);
    }).match(noop, console.error);
  });

  watch(
    () => session.value.data?.user.id,
    (newUserId) => {
      if (!newUserId || online.value) return;
      const previousOperation = pendingOperation;
      pendingOperation = getResultAsync(async () => {
        await previousOperation;
        const cachedRooms = await readIndexedDb(RoomIndexedDbStoreConfiguration, newUserId);
        if (session.value.data?.user.id !== newUserId || cachedRooms.length === 0) return;

        const cachedData = new CursorPaginationData<RoomInMessage>();
        cachedData.items = cachedRooms;
        initializeCursorPaginationData(cachedData);
      }).match(noop, console.error);
    },
  );

  const flush = () => pendingOperation;
  return { flush };
};
