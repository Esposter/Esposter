import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { Operation } from "@esposter/shared";

export const useReplyStore = defineStore("message/reply", () => {
  const roomStore = useRoomStore();
  const { data: rowKey } = useDataMap(() => roomStore.currentRoomId, "");
  MessageHookMap.ResetSend.push(() => {
    rowKey.value = "";
  });

  const dataStore = useDataStore();
  const { data: replyMap } = useDataMap(() => roomStore.currentRoomId, new Map<string, MessageEntity>());
  MessageHookMap[Operation.Create].push((message) => {
    if (!message.replyRowKey) return;
    const reply = dataStore.items.find(({ rowKey }) => rowKey === message.replyRowKey);
    if (!reply) return;
    replyMap.value.set(message.replyRowKey, reply);
  });
  MessageHookMap[Operation.Delete].push(({ rowKey }) => {
    replyMap.value.delete(rowKey);
  });

  const activeRowKey = ref<string>();
  const isIndicatorActive = ref(false);

  return {
    activeRowKey,
    isIndicatorActive,
    replyMap,
    rowKey,
  };
});
