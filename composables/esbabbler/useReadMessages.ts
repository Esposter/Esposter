import { type MessageEntity } from "@/models/esbabbler/message";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMessages = async () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { initialiseCursorPaginationData, pushMessages } = messageStore;
  const { nextCursor, hasMore } = storeToRefs(messageStore);
  const emojiStore = useEmojiStore();
  const { pushEmojiMap } = emojiStore;
  const readMoreMessages = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const response = await $client.message.readMessages.query({
        roomId: currentRoomId.value,
        cursor: nextCursor.value,
      });
      pushMessages(response.items);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;

      await readMoreEmojis(response.items);
    } finally {
      onComplete();
    }
  };
  const readMoreEmojis = async (messages: MessageEntity[]) => {
    if (!currentRoomId.value) return;

    const emojis = await $client.emoji.readEmojis.query({
      roomId: currentRoomId.value,
      messages: messages.map((m) => ({ rowKey: m.rowKey })),
    });
    pushEmojiMap(
      messages.map((m) => m.rowKey),
      emojis,
    );
  };

  if (currentRoomId.value) {
    const response = await $client.message.readMessages.query({ roomId: currentRoomId.value });
    initialiseCursorPaginationData(response);
    await readMoreEmojis(response.items);
  }

  return readMoreMessages;
};
