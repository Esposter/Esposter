import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { MessageHookMap } from "@/services/esbabbler/message/MessageHookMap";
import { createDataMap } from "@/services/shared/createDataMap";
import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";
import { Operation } from "@esposter/shared";

export const useReplyStore = defineStore("esbabbler/reply", () => {
  const roomStore = useRoomStore();
  const { data: rowKey } = createDataMap(() => roomStore.currentRoomId, "");
  MessageHookMap.ResetSend.push(() => {
    rowKey.value = "";
  });

  const messageStore = useMessageStore();
  const { data: replyMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, MessageEntity>());
  MessageHookMap[Operation.Create].push((message) => {
    if (!message.replyRowKey) return;
    const reply = messageStore.messages.find(({ rowKey }) => rowKey === message.replyRowKey);
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
