import type { ClientMessage } from "@/models/message/ClientMessage";
import type { RoomInMessage } from "@esposter/db-schema";

import { useEmojiStore } from "@/store/message/emoji";

export const useReadEmojis = () => {
  const { $trpc } = useNuxtApp();
  const emojiStore = useEmojiStore();
  const { setEmojis } = emojiStore;
  return async (roomId: RoomInMessage["id"], messageIds: ClientMessage["id"][]) => {
    if (messageIds.length === 0) return [];

    const emojis = await $trpc.message.emoji.readReactions.query({ messageIds, roomId });
    for (const messageId of messageIds)
      setEmojis(
        roomId,
        messageId,
        emojis.filter((emoji) => emoji.messageId === messageId),
      );
    return emojis;
  };
};
