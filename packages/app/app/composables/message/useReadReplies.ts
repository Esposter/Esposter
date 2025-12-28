import type { MessageEntity } from "@esposter/db-schema";

import { useReplyStore } from "@/store/message/reply";
import { useRoomStore } from "@/store/message/room";

export const useReadReplies = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const replyStore = useReplyStore();
  const { replyMap } = storeToRefs(replyStore);
  return async (replyRowKeys: MessageEntity["rowKey"][]) => {
    if (!currentRoomId.value || replyRowKeys.length === 0) return;

    const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({
      roomId: currentRoomId.value,
      rowKeys: replyRowKeys,
    });
    for (const messageByRowKey of messagesByRowKeys) replyMap.value.set(messageByRowKey.rowKey, messageByRowKey);
  };
};
