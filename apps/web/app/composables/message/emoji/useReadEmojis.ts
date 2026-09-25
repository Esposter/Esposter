import type { RoomInMessage } from "@esposter/db-schema";

import { useEmojiStore } from "@/store/message/emoji";

export const useReadEmojis = () => {
  const { $trpc } = useNuxtApp();
  const emojiStore = useEmojiStore();
  const { setEmojis } = emojiStore;
  return async (roomId: RoomInMessage["id"], messageRowKeys: string[]) => {
    if (messageRowKeys.length === 0) return;

    const emojis = await $trpc.message.emoji.readEmojis.query({ messageRowKeys, roomId });
    for (const messageRowKey of messageRowKeys)
      setEmojis(
        roomId,
        messageRowKey,
        emojis.filter((emoji) => emoji.messageRowKey === messageRowKey),
      );
  };
};
