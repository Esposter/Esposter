import type { MessageEntity, RoomInMessage } from "@esposter/db-schema";

import { useReplyStore } from "@/store/message/input/reply";

export const useReadReplies = () => {
  const { $trpc } = useNuxtApp();
  const replyStore = useReplyStore();
  const { replyMap } = storeToRefs(replyStore);
  return async (roomId: RoomInMessage["id"], replyRowKeys: MessageEntity["rowKey"][]) => {
    if (replyRowKeys.length === 0) return;

    const messages = await $trpc.message.readMessagesByRowKeys.query({ roomId, rowKeys: replyRowKeys });
    for (const message of messages) replyMap.value.set(message.rowKey, message);
  };
};
