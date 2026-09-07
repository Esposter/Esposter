import type { MessageEntity } from "@esposter/db-schema";

import { useReplyStore } from "@/store/message/input/reply";
import { useRoomStore } from "@/store/message/room";

export const useReadReplies = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const replyStore = useReplyStore();
  const { replyMap } = storeToRefs(replyStore);
  return async (replyRowKeys: MessageEntity["rowKey"][]) => {
    if (!currentRoomId.value || replyRowKeys.length === 0) return;

    const messages = await $trpc.message.readMessagesByRowKeys.query({
      roomId: currentRoomId.value,
      rowKeys: replyRowKeys,
    });
    for (const message of messages) replyMap.value.set(message.rowKey, message);
  };
};
