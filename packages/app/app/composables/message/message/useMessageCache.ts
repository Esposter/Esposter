import type { MessageEntity } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

export const useMessageCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  const { initializeCursorPaginationData } = dataStore;
  const online = useOnline();
  let pendingOperation: Promise<void> = Promise.resolve();

  watchDeep(items, (messages) => {
    if (!currentRoomId.value || messages.length === 0) return;
    const roomId = currentRoomId.value;
    pendingOperation = pendingOperation
      .catch(() => undefined)
      .then(() =>
        writeIndexedDb(
          MessageIndexedDbStoreConfiguration,
          messages.filter((message) => !message.isLoading),
          roomId,
        ),
      );
  });

  watch(currentRoomId, (roomId) => {
    if (!roomId || online.value) return;
    pendingOperation = pendingOperation
      .catch(() => undefined)
      .then(async () => {
        const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, roomId);
        if (currentRoomId.value !== roomId || items.value.length > 0 || cachedMessages.length === 0) return;

        const cachedData = new CursorPaginationData<MessageEntity>();
        cachedData.items = cachedMessages;
        initializeCursorPaginationData(cachedData);
      });
  });

  const flush = () => pendingOperation;
  return { flush };
};
