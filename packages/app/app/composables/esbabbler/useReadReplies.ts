import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadReplies = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { replyMap } = storeToRefs(messageStore);
  return async (messages: MessageEntity[]) => {
    if (!currentRoomId.value) return;

    const replyToMessageRowKeys: string[] = [];
    for (const { replyToMessageRowKey } of messages) {
      if (!replyToMessageRowKey) continue;
      replyToMessageRowKeys.push(replyToMessageRowKey);
    }
    if (replyToMessageRowKeys.length === 0) return;

    const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({
      roomId: currentRoomId.value,
      rowKeys: replyToMessageRowKeys,
    });
    for (const messageByRowKey of messagesByRowKeys) replyMap.value.set(messageByRowKey.rowKey, messageByRowKey);
  };
};
