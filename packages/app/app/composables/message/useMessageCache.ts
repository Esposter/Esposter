import type { MessageEntity } from "@esposter/db-schema";
import type { WatchHandle } from "vue";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { readCachedMessages } from "@/services/message/cache/readCachedMessages";
import { writeCachedMessages } from "@/services/message/cache/writeCachedMessages";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

// @TODO: Cached messages flash then disappear on offline room switch — root cause still unknown
export const useMessageCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  const online = useOnline();
  const watchHandles: WatchHandle[] = [];

  onMounted(() => {
    watchHandles.push(
      watchDeep(items, (messages) => {
        if (!currentRoomId.value || messages.length === 0) return;
        writeCachedMessages(currentRoomId.value, messages);
      }),
    );

    watchHandles.push(
      watch(currentRoomId, async (roomId) => {
        if (!roomId || online.value) return;
        const cachedMessages = await readCachedMessages(roomId);
        if (currentRoomId.value !== roomId || items.value.length > 0 || cachedMessages.length === 0) return;

        const cachedData = new CursorPaginationData<MessageEntity>();
        cachedData.items = cachedMessages;
        cachedData.hasMore = true;
        dataStore.initializeCursorPaginationData(cachedData);
      }),
    );
  });

  onUnmounted(() => {
    for (const watchHandle of watchHandles) watchHandle();
  });
};
