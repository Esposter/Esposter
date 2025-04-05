import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useEmojiStore } from "@/store/esbabbler/emoji";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadEmojis = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { setEmojiList } = emojiStore;
  return async (messages: MessageEntity[]) => {
    if (!currentRoomId.value) return;

    const messageRowKeys = messages.map(({ rowKey }) => rowKey);
    const emojis = await $trpc.emoji.readEmojis.query({ messageRowKeys, roomId: currentRoomId.value });
    for (const messageRowKey of messageRowKeys)
      setEmojiList(
        messageRowKey,
        emojis.filter((e) => e.messageRowKey === messageRowKey),
      );
  };
};
