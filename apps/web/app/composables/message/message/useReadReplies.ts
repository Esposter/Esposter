import type { ClientMessage } from "@/models/message/ClientMessage";
import type { RoomInMessage } from "@esposter/db-schema";

import { useReplyStore } from "@/store/message/input/reply";

export const useReadReplies = () => {
  const { $trpc } = useNuxtApp();
  const replyStore = useReplyStore();
  const { getReplyMapRef } = replyStore;
  return async (roomId: RoomInMessage["id"], replyToIds: ClientMessage["id"][]) => {
    if (replyToIds.length === 0) return;

    const messages = await $trpc.message.readMessagesByIds.query({ messageIds: replyToIds, roomId });
    const replyMap = getReplyMapRef(roomId);
    for (const message of messages) replyMap.value.set(message.id, { ...message, roomId });
  };
};
