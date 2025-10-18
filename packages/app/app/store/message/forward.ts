import type { MessageEntity } from "@esposter/db-schema";

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useRoomStore } from "@/store/message/room";
import { Operation } from "@esposter/shared";

export const useForwardStore = defineStore("message/forward", () => {
  const roomStore = useRoomStore();
  const { data: rowKey } = useDataMap(() => roomStore.currentRoomId, "");
  const { data: forwardMap } = useDataMap(() => roomStore.currentRoomId, new Map<string, MessageEntity>());
  MessageHookMap[Operation.Create].push((message) => {
    if (!message.isForward) return;
    forwardMap.value.set(message.rowKey, message);
  });
  MessageHookMap[Operation.Delete].push(({ rowKey }) => {
    forwardMap.value.delete(rowKey);
  });

  const { data: roomIds } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput } = useDataMap(() => roomStore.currentRoomId, "");
  return {
    forwardMap,
    messageInput,
    roomIds,
    rowKey,
  };
});
