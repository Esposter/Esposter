import type { MessageEntity } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

export const useForwardStore = defineStore("message/forward", () => {
  const roomStore = useRoomStore();
  const { data: rowKey } = useDataMap(() => roomStore.currentRoomId, "");
  const { data: forwardMap } = useDataMap(() => roomStore.currentRoomId, new Map<string, MessageEntity>());
  const { data: roomIds } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput } = useDataMap(() => roomStore.currentRoomId, "");
  return {
    forwardMap,
    messageInput,
    roomIds,
    rowKey,
  };
});
