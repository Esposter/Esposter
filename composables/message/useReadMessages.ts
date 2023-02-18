import { useEmojiStore } from "@/store/chat/useEmojiStore";
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";
import { useMessageStore } from "@/store/chat/useMessageStore";
import { useRoomStore } from "@/store/chat/useRoomStore";

export const useReadMessages = async () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageInputStore = useMessageInputStore();
  const { initialiseMessageInput } = messageInputStore;
  const messageStore = useMessageStore();
  const { pushMessageList, updateMessageListNextCursor, initialiseMessageList } = messageStore;
  const { messageListNextCursor } = storeToRefs(messageStore);
  const emojiStore = useEmojiStore();
  const { pushEmojiMap } = emojiStore;
  const readMoreMessages = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const { messages, nextCursor } = await $client.message.readMessages.query({
        roomId: currentRoomId.value,
        cursor: messageListNextCursor.value,
      });
      if (messages.length === 0) return;

      pushMessageList(messages);
      updateMessageListNextCursor(nextCursor);

      const emojis = await $client.emoji.readEmojis.query({
        roomId: currentRoomId.value,
        messages: messages.map((m) => ({ rowKey: m.rowKey })),
      });
      if (emojis.length === 0) return;

      pushEmojiMap(
        messages.map((m) => m.rowKey),
        emojis
      );
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value) {
    initialiseMessageInput();

    const { messages, nextCursor } = await $client.message.readMessages.query({
      roomId: currentRoomId.value,
      cursor: messageListNextCursor.value,
    });
    if (messages.length === 0) return readMoreMessages;

    initialiseMessageList(messages);
    updateMessageListNextCursor(nextCursor);

    const emojis = await $client.emoji.readEmojis.query({
      roomId: currentRoomId.value,
      messages: messages.map((m) => ({ rowKey: m.rowKey })),
    });
    if (emojis.length === 0) return readMoreMessages;

    pushEmojiMap(
      messages.map((m) => m.rowKey),
      emojis
    );
  }

  return readMoreMessages;
};
