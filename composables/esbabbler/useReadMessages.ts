import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMessages = async () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { initialiseCursorPaginationData, pushMessageList } = messageStore;
  const { nextCursor, hasMore } = storeToRefs(messageStore);
  const readEmojis = useReadEmojis();
  const readMoreMessages = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const response = await $client.message.readMessages.query({
        roomId: currentRoomId.value,
        cursor: nextCursor.value,
      });
      pushMessageList(response.items);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      await readEmojis(response.items.map((m) => m.rowKey));
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value) {
    const response = await $client.message.readMessages.query({ roomId: currentRoomId.value });
    initialiseCursorPaginationData(response);
    await readEmojis(response.items.map((m) => m.rowKey));
  }

  return readMoreMessages;
};
