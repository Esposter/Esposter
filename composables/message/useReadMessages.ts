import { useMessageStore } from "@/store/chat/useMessageStore";
import { useRoomStore } from "@/store/chat/useRoomStore";

export const useReadMessages = async () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));
  const messageStore = useMessageStore();
  const { pushMessageList, updateMessageListNextCursor, initialiseMessageList } = messageStore;
  const { messageListNextCursor } = $(storeToRefs(messageStore));

  const readMoreMessages = async (onComplete: () => void) => {
    try {
      if (!currentRoomId) return;

      const { messages, nextCursor } = await $client.message.readMessages.query({
        partitionKey: currentRoomId,
        cursor: messageListNextCursor,
      });
      pushMessageList(messages);
      updateMessageListNextCursor(nextCursor);
    } finally {
      onComplete();
    }
  };

  if (currentRoomId) {
    const { messages, nextCursor } = await $client.message.readMessages.query({
      partitionKey: currentRoomId,
      cursor: null,
    });
    initialiseMessageList(messages);
    updateMessageListNextCursor(nextCursor);
  }

  return { readMoreMessages };
};
