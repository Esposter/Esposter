import type { MessageEntity } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { MessageCacheStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageCacheStoreConfiguration";
import { readCached } from "@/services/cache/indexedDb/readCached";
import { writeCached } from "@/services/cache/indexedDb/writeCached";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

// @TODO: Cached messages flash then disappear on offline room switch — root cause still unknown
export const useMessageCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  const online = useOnline();
  let pendingOperation: Promise<void> = Promise.resolve();

  watchDeep(items, (messages) => {
    if (!currentRoomId.value || messages.length === 0) return;
    pendingOperation = writeCached(
      MessageCacheStoreConfiguration,
      messages.filter((message) => !message.isLoading),
      currentRoomId.value,
    );
  });

  watch(currentRoomId, (roomId) => {
    if (!roomId || online.value) return;
    pendingOperation = (async () => {
      const cachedMessages = await readCached<MessageEntity>(MessageCacheStoreConfiguration, roomId);
      if (currentRoomId.value !== roomId || items.value.length > 0 || cachedMessages.length === 0) return;

      const cachedData = new CursorPaginationData<MessageEntity>();
      cachedData.items = cachedMessages;
      cachedData.hasMore = true;
      dataStore.initializeCursorPaginationData(cachedData);
    })();
  });

  const flush = () => pendingOperation;
  return { flush };
};
