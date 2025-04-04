import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMessages = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { initializeCursorPaginationData, pushMessageList } = messageStore;
  const { hasMore, nextCursor } = storeToRefs(messageStore);
  const readEmojis = useReadEmojis();
  const readMissingMembers = useReadMissingMembers();
  const readMoreMessages = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const response = await $trpc.message.readMessages.query({
        cursor: nextCursor.value,
        roomId: currentRoomId.value,
      });
      pushMessageList(...response.items);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      await Promise.all([readEmojis(response.items), readMissingMembers(response.items)]);
    } finally {
      onComplete();
    }
  };

  const onComplete = async () => {
    if (!currentRoomId.value) return;

    const response = await $trpc.message.readMessages.query({ roomId: currentRoomId.value });
    initializeCursorPaginationData(response);
    if (response.items.length === 0) return;

    await Promise.all([readEmojis(response.items), readMissingMembers(response.items)]);
  };

  await onComplete();
  return readMoreMessages;
};
