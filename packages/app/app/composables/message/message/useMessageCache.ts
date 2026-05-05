import type { MessageEntity } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { getResultAsync } from "@esposter/shared";

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
    pendingOperation = getResultAsync(async () => {
      await pendingOperation;
      await writeIndexedDb(
        MessageIndexedDbStoreConfiguration,
        messages.filter((message) => !message.isLoading),
        roomId,
      );
    })
      .orTee(console.error)
      .unwrapOr(undefined);
  });

  watch(currentRoomId, (newCurrentRoomId) => {
    if (!newCurrentRoomId || online.value) return;
    pendingOperation = getResultAsync(async () => {
      await pendingOperation;
      const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, newCurrentRoomId);
      if (currentRoomId.value !== newCurrentRoomId || items.value.length > 0 || cachedMessages.length === 0) return;

      const cachedData = new CursorPaginationData<MessageEntity>();
      cachedData.items = cachedMessages;
      initializeCursorPaginationData(cachedData);
    })
      .orTee(console.error)
      .unwrapOr(undefined);
  });

  const flush = () => pendingOperation;
  return { flush };
};
