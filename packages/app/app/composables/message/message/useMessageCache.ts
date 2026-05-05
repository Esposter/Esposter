import type { MessageEntity } from "@esposter/db-schema";

import { getResultAsync } from "#shared/error/getResultAsync";
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
    const roomId = currentRoomId.value;
    if (!roomId || messages.length === 0) return;
    pendingOperation = getResultAsync(() => pendingOperation)
      .orTee(console.error)
      .unwrapOr(undefined)
      .then(() =>
        writeIndexedDb(
          MessageIndexedDbStoreConfiguration,
          messages.filter((message) => !message.isLoading),
          roomId,
        ),
      );
  });

  watch(currentRoomId, (newCurrentRoomId) => {
    if (!newCurrentRoomId || online.value) return;
    pendingOperation = getResultAsync(() => pendingOperation)
      .orTee(console.error)
      .unwrapOr(undefined)
      .then(async () => {
        const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, newCurrentRoomId);
        if (currentRoomId.value !== newCurrentRoomId || items.value.length > 0 || cachedMessages.length === 0) return;

        const cachedData = new CursorPaginationData<MessageEntity>();
        cachedData.items = cachedMessages;
        initializeCursorPaginationData(cachedData);
      });
  });

  const flush = () => pendingOperation;
  return { flush };
};
